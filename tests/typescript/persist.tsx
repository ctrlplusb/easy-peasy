import { persist, createTransform, useStoreRehydrated } from 'easy-peasy';

persist({
  foo: 'bar',
});

const model = persist(
  {
    foo: 'bar',
  },
  {
    blacklist: ['foo'],
    whitelist: ['foo'],
    mergeStrategy: 'merge',
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

createTransform((data, key) => `${key}foo`);

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
