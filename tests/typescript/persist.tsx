import * as React from 'react';
import { createTransform, persist, useStoreRehydrated } from 'easy-peasy';

persist({
  foo: 'bar',
});

const model = persist(
  {
    foo: 'bar',
  },
  {
    allow: ['foo'],
    deny: ['foo'],
    mergeStrategy: 'mergeShallow',
    storage: 'sessionStorage',
    transformers: [
      {
        in: (data, key) => `${key}foo`,
        out: (data, key) => `${key}foo`,
      },
    ],
  },
);

`${model.foo}baz`;

persist(
  {
    foo: 'bar',
  },
  {
    migrations: {
      migrationVersion: 1,

      1: (state) => {
        state.foo = 'bar';
        delete state.migrationConflict
      }
    },
  },
);

createTransform(
  (data, key) => `${key}foo`,
  (data, key) => `${key}foo`,
  {
    whitelist: ['foo'],
    blacklist: ['foo'],
  },
);

createTransform(
  (data, key) => `${key}foo`,
  (data, key) => `${key}foo`,
);

createTransform((data, key, fullState) => `${key}foo`);

createTransform(undefined, (data, key) => `${key}foo`, {
  whitelist: ['foo'],
  blacklist: ['foo'],
});

createTransform(undefined, undefined, {
  whitelist: ['foo'],
  blacklist: ['foo'],
});

const transformer = createTransform(
  (data, key) => `${key}foo`,
  (data, key) => `${key}foo`,
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
