import { clone, get, isPlainObject, isPromise, set, pSeries } from './lib';

const noopStorage = {
  getItem: () => undefined,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const getBrowerStorage = (storageName) => {
  let storageCache;
  return () => {
    if (!storageCache) {
      try {
        if (
          typeof window !== 'undefined' &&
          typeof window[storageName] !== 'undefined'
        ) {
          storageCache = window[storageName];
        }
      } catch (_) {
        // swallow the failure
      }
      if (!storageCache) {
        storageCache = noopStorage;
      }
    }

    return storageCache;
  };
};

const localStorage = getBrowerStorage('localStorage');
const sessionStorage = getBrowerStorage('sessionStorage');

function createStorageWrapper(storage, transformers = []) {
  if (storage == null) {
    storage = sessionStorage();
  }

  if (typeof storage === 'string') {
    if (storage === 'localStorage') {
      storage = localStorage();
    } else if (storage === 'sessionStorage') {
      storage = sessionStorage();
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Invalid storage provider`);
      }
      storage = noopStorage;
    }
  }

  const outTransformers = [...transformers].reverse();

  const serialize = (data) => {
    if (transformers.length > 0 && data != null && typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        data[key] = transformers.reduce(
          (acc, cur) => cur.in(acc, key),
          data[key],
        );
      });
    }

    return storage === localStorage() || storage === sessionStorage()
      ? JSON.stringify({ data })
      : data;
  };

  const deserialize = (data) => {
    const result =
      storage === localStorage() || storage === sessionStorage()
        ? JSON.parse(data).data
        : data;
    if (
      outTransformers.length > 0 &&
      result != null &&
      typeof result === 'object'
    ) {
      Object.keys(result).forEach((key) => {
        result[key] = outTransformers.reduce(
          (acc, cur) => cur.out(acc, key),
          result[key],
        );
      });
    }
    return result;
  };

  const isAsync = isPromise(storage.getItem('_'));

  return {
    getItem: (key) => {
      if (isAsync) {
        return storage
          .getItem(key)
          .then((wrapped) =>
            wrapped != null ? deserialize(wrapped) : undefined,
          );
      }
      const wrapped = storage.getItem(key);
      return wrapped != null ? deserialize(wrapped) : undefined;
    },
    setItem: (key, data) => storage.setItem(key, serialize(data)),
    removeItem: (key) => storage.removeItem(key),
  };
}

export function extractPersistConfig(path, persistdef = {}) {
  return {
    path,
    config: {
      allow: persistdef.allow || [],
      deny: persistdef.deny || [],
      mergeStrategy: persistdef.mergeStrategy || 'mergeDeep',
      storage: createStorageWrapper(
        persistdef.storage,
        persistdef.transformers,
      ),
    },
  };
}

function resolvePersistTargets(target, allow, deny) {
  let targets = Object.keys(target);
  if (allow.length > 0) {
    targets = targets.reduce((acc, cur) => {
      if (allow.findIndex((x) => x === cur) !== -1) {
        return [...acc, cur];
      }
      return acc;
    }, []);
  }
  if (deny.length > 0) {
    targets = targets.reduce((acc, cur) => {
      if (deny.findIndex((x) => x === cur) !== -1) {
        return acc;
      }
      return [...acc, cur];
    }, []);
  }
  return targets;
}

function createPersistenceClearer(persistKey, _r) {
  return () => {
    if (_r._i._persistenceConfig.length === 0) {
      return Promise.resolve();
    }
    return pSeries(
      _r._i._persistenceConfig.map(({ path, config }) => () =>
        Promise.resolve(config.storage.removeItem(persistKey(path))),
      ),
    );
  };
}

export function createPersistor(persistKey, _r) {
  let persistPromise = Promise.resolve();
  let isPersisting = false;
  let nextPersistOperation;

  const timingMethod =
    typeof window === 'undefined'
      ? (fn) => fn()
      : window.requestIdleCallback != null
      ? window.requestIdleCallback
      : window.requestAnimationFrame;

  const persist = (nextState) => {
    if (_r._i._persistenceConfig.length === 0) {
      return;
    }

    const operation = () => {
      isPersisting = true;
      persistPromise = new Promise((resolve) => {
        timingMethod(() => {
          pSeries(
            _r._i._persistenceConfig.map(({ path, config }) => () => {
              const { storage, allow, deny } = config;
              const persistRootState = clone(get(path, nextState));
              const persistTargets = resolvePersistTargets(
                persistRootState,
                allow,
                deny,
              );
              const stateToPersist = {};
              persistTargets.map((key) => {
                const targetPath = [...path, key];
                const rawValue = get(targetPath, nextState);
                const value = isPlainObject(rawValue)
                  ? clone(rawValue)
                  : rawValue;
                stateToPersist[key] = value;
              });
              return Promise.resolve(
                storage.setItem(persistKey(path), stateToPersist),
              );
            }),
          ).finally(() => {
            isPersisting = false;
            if (nextPersistOperation) {
              const next = nextPersistOperation;
              nextPersistOperation = null;
              next();
            } else {
              resolve();
            }
          });
        });
      });
    };

    if (isPersisting) {
      nextPersistOperation = operation;
    } else {
      operation();
    }
  };

  return {
    persist,
    clear: createPersistenceClearer(persistKey, _r),
    flush: () => {
      if (nextPersistOperation) {
        nextPersistOperation();
      }
      return persistPromise;
    },
  };
}

export function createPersistMiddleware(persistor, _r) {
  return ({ getState }) => (next) => (action) => {
    const state = next(action);
    if (
      action &&
      action.type !== '@action.ePRS' &&
      _r._i._persistenceConfig.length > 0
    ) {
      persistor.persist(getState());
    }
    return state;
  };
}

export function rehydrateStateFromPersistIfNeeded(
  persistKey,
  replaceState,
  _r,
  root,
) {
  if (_r._i._persistenceConfig.length === 0) {
    return Promise.resolve();
  }

  const state = clone(_r._i._dS);

  let rehydrating = false;

  return pSeries(
    _r._i._persistenceConfig.map((persistInstance) => () => {
      const { path, config } = persistInstance;
      const { mergeStrategy, storage } = config;

      if (root && (path.length < 1 || path[0] !== root)) {
        return Promise.resolve();
      }

      const hasDataModelChanged = (dataModel, rehydratingModelData) =>
        dataModel != null &&
        rehydratingModelData != null &&
        (typeof dataModel !== typeof rehydratingModelData ||
          (Array.isArray(dataModel) && !Array.isArray(rehydratingModelData)));

      const applyRehydrationStrategy = (persistedState) => {
        if (mergeStrategy === 'overwrite') {
          set(path, state, persistedState);
        } else if (mergeStrategy === 'mergeShallow') {
          const targetState = get(path, state);
          Object.keys(persistedState).forEach((key) => {
            if (hasDataModelChanged(targetState[key], persistedState[key])) {
              // skip as the data model type has changed since the data was persisted
            } else {
              targetState[key] = persistedState[key];
            }
          });
        } else if (mergeStrategy === 'mergeDeep') {
          const targetState = get(path, state);
          const setAt = (currentTargetState, currentPersistedState) => {
            Object.keys(currentPersistedState).forEach((key) => {
              if (
                hasDataModelChanged(
                  currentTargetState[key],
                  currentPersistedState[key],
                )
              ) {
                // skip as the data model type has changed since the data was persisted
              } else if (isPlainObject(currentPersistedState[key])) {
                currentTargetState[key] = currentTargetState[key] || {};
                setAt(currentTargetState[key], currentPersistedState[key]);
              } else {
                currentTargetState[key] = currentPersistedState[key];
              }
            });
          };
          setAt(targetState, persistedState);
        }
      };

      const rehydate = (persistedState) => {
        if (persistedState != null) {
          applyRehydrationStrategy(persistedState);
          rehydrating = true;
        }
      };

      const getItemResult = storage.getItem(persistKey(path));
      if (isPromise(getItemResult)) {
        return getItemResult.then(rehydate);
      }
      return Promise.resolve(rehydate(getItemResult));
    }),
  ).then(() => {
    if (rehydrating) {
      replaceState(state);
    }
  });
}
