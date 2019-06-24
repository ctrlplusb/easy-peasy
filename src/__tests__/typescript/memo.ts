import { memo } from 'easy-peasy';

const fn = (name: string, age: number) => ({
  name,
  age,
});

const memoizedFn = memo(fn, 2);

memoizedFn('Bob', 23);

// typings:expect-error
memoizedFn('Bob', 'Foo');

// typings:expect-error
memo(fn);

// typings:expect-error
memo(fn, '1');
