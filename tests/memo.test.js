import { memo } from '../src';

it.skip('should memoize according to the cache size limit', () => {
  // arrange
  let fnHit = 0;
  const memoized = memo((firstName, lastName) => {
    fnHit += 1;
    return `${firstName} ${lastName}`;
  }, 2);

  // act
  memoized('Bob', 'Poppins');

  // assert
  expect(fnHit).toBe(1);

  // act
  memoized('Mary', 'Poppins');

  // assert
  expect(fnHit).toBe(2);

  // act
  memoized('Bob', 'Poppins');

  // assert
  expect(fnHit).toBe(2);

  // act
  memoized('Isla', 'Poppins');

  // assert
  expect(fnHit).toBe(3);
});

it('does not memoize', () => {
  const memoized = memo((firstName, lastName) => {
    return `${firstName} ${lastName}`;
  }, 2);

  expect(memoized('Bob', 'Poppins')).toEqual('Bob Poppins');
});
