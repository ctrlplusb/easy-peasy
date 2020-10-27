import { memo } from '../src';

it.skip('should memoize according to the cache size limit', () => {
  // ARRANGE
  let fnHit = 0;
  const memoized = memo((firstName, lastName) => {
    fnHit += 1;
    return `${firstName} ${lastName}`;
  }, 2);

  // ACT
  memoized('Bob', 'Poppins');

  // ASSERT
  expect(fnHit).toBe(1);

  // ACT
  memoized('Mary', 'Poppins');

  // ASSERT
  expect(fnHit).toBe(2);

  // ACT
  memoized('Bob', 'Poppins');

  // ASSERT
  expect(fnHit).toBe(2);

  // ACT
  memoized('Isla', 'Poppins');

  // ASSERT
  expect(fnHit).toBe(3);
});

it('does not memoize', () => {
  const memoized = memo((firstName, lastName) => {
    return `${firstName} ${lastName}`;
  }, 2);

  expect(memoized('Bob', 'Poppins')).toEqual('Bob Poppins');
});
