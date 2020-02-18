import debounce from 'debounce';
import isPlainObject from 'is-plain-object';
import { deepCloneStateWithoutComputed, get, isPromise, set } from './lib';

const noopStorage = {
  getItem: () => undefined,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function getStorage(storageName) {
  try {
    if (
      typeof window !== 'undefined' &&
      typeof window[storageName] !== 'undefined'
    ) {
      return window[storageName];
    }
    return noopStorage;
  } catch (_) {
    return noopStorage;
  }
}

const localStorage = getStorage('localStorage');
const sessionStorage = getStorage('sessionStorage');

function createStorageWrapper(storage = sessionStorage, transformers = []) {
  if (typeof storage === 'string') {
    if (storage === 'localStorage') {
      storage = localStorage;
    } else if (storage === 'sessionStorage') {
      storage = sessionStorage;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Invalid storage provider specified for Easy Peasy persist: ${storage}\nValid values include "localStorage", "sessionStorage" or a custom storage engine.`,
        );
      }
      storage = noopStorage;
    }
  }

  const outTransformers = transformers.reverse();

  const serialize = (data, key) => {
    const simpleKey = key.substr(key.indexOf('@') + 1);
    const transformed = transformers.reduce((acc, cur) => {
      return cur.in(acc, simpleKey);
    }, data);
    return storage === localStorage || storage === sessionStorage
      ? JSON.stringify({ data: transformed })
      : transformed;
  };
  const deserialize = (data, key) => {
    const simpleKey = key.substr(key.indexOf('@') + 1);
    const result =
      storage === localStorage || storage === sessionStorage
        ? JSON.parse(data).data
        : data;
    return outTransformers.reduce((acc, cur) => {
      return cur.out(acc, simpleKey);
    }, result);
  };

  const isAsync = isPromise(storage.getItem('_'));

  return {
    isAsync,
    getItem: key => {
      if (isAsync) {
        return storage.getItem(key).then(wrapped => {
          return wrapped != null ? deserialize(wrapped, key) : undefined;
        });
      }
      const wrapped = storage.getItem(key);
      return wrapped != null ? deserialize(wrapped, key) : undefined;
    },
    setItem: (key, data) => {
      return storage.setItem(key, serialize(data, key));
    },
    removeItem: key => {
      return storage.removeItem(key);
    },
  };
}

export function extractPersistConfig(path, persistDefinition = {}) {
  return {
    path,
    config: {
      blacklist: persistDefinition.blacklist || [],
      mergeStrategy: persistDefinition.mergeStrategy || 'merge',
      storage: createStorageWrapper(
        persistDefinition.storage,
        persistDefinition.transformers,
      ),
      whitelist: persistDefinition.whitelist || [],
    },
  };
}

function resolvePersistTargets(target, whitelist, blacklist) {
  let targets = Object.keys(target);
  if (whitelist.length > 0) {
    targets = targets.reduce((acc, cur) => {
      if (whitelist.findIndex(x => x === cur) !== -1) {
        return [...acc, cur];
      }
      return acc;
    }, []);
  }
  if (blacklist.length > 0) {
    targets = targets.reduce((acc, cur) => {
      if (blacklist.findIndex(x => x === cur) !== -1) {
        return acc;
      }
      return [...acc, cur];
    }, []);
  }
  return targets;
}

export function createPersistor(persistKey, references) {
  return debounce(() => {
    references.internals.persistenceConfig.forEach(({ path, config }) => {
      const { storage, whitelist, blacklist } = config;
      const state = references.getState();
      const persistRoot = deepCloneStateWithoutComputed(get(path, state));
      const targets = resolvePersistTargets(persistRoot, whitelist, blacklist);
      targets.forEach(key => {
        const targetPath = [...path, key];
        storage.setItem(persistKey(targetPath), get(targetPath, state));
      });
    });
  }, 1000);
}

export function createPersistMiddleware(persistor, references) {
  return () => next => action => {
    const state = next(action);
    if (
      action &&
      action.type !== '@action.ePRS' &&
      references.internals.persistenceConfig.length > 0
    ) {
      persistor(state);
    }
    return state;
  };
}

export function createPersistenceClearer(persistKey, references) {
  return () =>
    new Promise((resolve, reject) => {
      references.internals.persistenceConfig.forEach(({ path, config }) => {
        const { storage, whitelist, blacklist } = config;
        const persistRoot = get(path, references.getState());
        const targets = resolvePersistTargets(
          persistRoot,
          whitelist,
          blacklist,
        );
        if (targets.length > 0) {
          Promise.all(
            targets.map(key => {
              const targetPath = [...path, key];
              return storage.removeItem(persistKey(targetPath));
            }),
          ).then(() => resolve(), reject);
        } else {
          resolve();
        }
      });
    });
}

export function rehydrateStateFromPersistIfNeeded(
  persistKey,
  replaceState,
  references,
) {
  // If we have any persist configs we will attemp to perform a state rehydration
  let resolveRehydration = Promise.resolve();
  if (references.internals.persistenceConfig.length > 0) {
    references.internals.persistenceConfig.forEach(persistInstance => {
      const { path, config } = persistInstance;
      const { blacklist, mergeStrategy, storage, whitelist } = config;

      const state = references.internals.defaultState;
      const persistRoot = deepCloneStateWithoutComputed(get(path, state));
      const targets = resolvePersistTargets(persistRoot, whitelist, blacklist);

      const applyRehydrationStrategy = (originalState, rehydratedState) => {
        if (mergeStrategy === 'overwrite') {
          set(path, originalState, rehydratedState);
        } else if (mergeStrategy === 'merge') {
          const target = get(path, originalState);
          Object.keys(rehydratedState).forEach(key => {
            target[key] = rehydratedState[key];
          });
        } else if (mergeStrategy === 'mergeDeep') {
          const target = get(path, originalState);
          const setAt = (currentTarget, currentNext) => {
            Object.keys(currentNext).forEach(key => {
              const data = currentNext[key];
              if (isPlainObject(data)) {
                if (!isPlainObject(currentTarget[key])) {
                  currentTarget[key] = {};
                }
                setAt(currentTarget[key], data);
              } else {
                currentTarget[key] = data;
              }
            });
          };
          setAt(target, rehydratedState);
        }
      };

      if (storage.isAsync) {
        const asyncStateResolvers = targets.reduce((acc, key) => {
          const targetPath = [...path, key];
          const dataPromise = storage.getItem(persistKey(targetPath));
          if (isPromise(dataPromise)) {
            acc.push({
              key,
              dataPromise,
            });
          }
          return acc;
        }, []);
        if (asyncStateResolvers.length > 0) {
          resolveRehydration = Promise.all(
            asyncStateResolvers.map(x => x.dataPromise),
          ).then(resolvedData => {
            const next = resolvedData.reduce((acc, cur, idx) => {
              const { key } = asyncStateResolvers[idx];
              if (cur !== undefined) {
                acc[key] = cur;
              }
              return acc;
            }, {});
            if (Object.keys(next).length === 0) {
              return;
            }
            applyRehydrationStrategy(state, next);
            replaceState(state);
          });
        }
      } else {
        const next = targets.reduce((acc, key) => {
          const targetPath = [...path, key];
          const data = storage.getItem(persistKey(targetPath));
          if (data !== undefined) {
            acc[key] = data;
          }
          return acc;
        }, {});
        applyRehydrationStrategy(state, next);
        replaceState(state);
      }
    });
  }
  return resolveRehydration;
}
