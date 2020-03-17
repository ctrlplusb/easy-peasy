/* eslint-disable */

import {
  createStore,
  model,
  Model,
  createTransform,
  useStoreRehydrated,
} from 'easy-peasy';

type StoreModel = Model<{
  foo: string;
  bar: string;
}>;

const customTransformer = createTransform(
  (data, key) => key + 'foo',
  (data, key) => key + 'foo',
  {
    whitelist: ['foo'],
    blacklist: ['foo'],
  },
);

const storeModel = model<StoreModel>(
  {
    foo: 'foo',
    bar: 'bar',
  },
  {
    persist: {
      blacklist: ['foo'],
      whitelist: ['bar'],
      mergeStrategy: 'merge',
      storage: 'sessionStorage',
      transformers: [
        {
          in: (data, key) => key + 'foo',
          out: (data, key) => key + 'foo',
        },
        customTransformer,
      ],
    },
  },
);

createTransform(
  (data, key) => key + 'foo',
  (data, key) => key + 'foo',
);

createTransform((data, key) => key + 'foo');

createTransform(undefined, (data, key) => key + 'foo', {
  whitelist: ['foo'],
  blacklist: ['foo'],
});

createTransform(undefined, undefined, {
  whitelist: ['foo'],
  blacklist: ['foo'],
});

const transformer = createTransform(
  (data, key) => key + 'foo',
  (data, key) => key + 'foo',
  {
    whitelist: ['foo'],
    blacklist: ['foo'],
  },
);

if (transformer.in) {
  transformer.in('foo', 'bar');
}

if (transformer.out) {
  transformer.out('foo', 'bar');
}

function App() {
  const rehydrated = useStoreRehydrated();
  return rehydrated ? <div>Loaded</div> : <div>Loading...</div>;
}
