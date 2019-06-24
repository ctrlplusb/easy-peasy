import { memo } from '..';

it('should memoize according to the cache size limit', () => {
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
