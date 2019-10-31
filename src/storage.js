import { isPromise } from './lib';

export const noopStorage = {
  getItem: () => undefined,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const localStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : noopStorage;

export const sessionStorage =
  typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
    ? window.sessionStorage
    : noopStorage;

export function createStorageWrapper(
  storage = sessionStorage,
  transformers = [],
) {
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
