/* eslint-disable no-useless-computed-key */
import { migrate } from '../src/migrations';

test('leaves an object untouched if there are no migrations pending', () => {
  // ARRANGE
  const result = migrate(
    {
      _migrationVersion: 1,
      value: 'untouched',
    },
    {
      migrationVersion: 1,

      [1]: (state) => {
        state.value = 'modified';
      },
    },
  );

  // ASSERT
  expect(result.value).toBe('untouched');
  expect(result._migrationVersion).toBe(1);
});

test('applies a migration if there is one pending', () => {
  // ARRANGE
  const result = migrate(
    {
      _migrationVersion: 0,
      value: 'untouched',
    },
    {
      migrationVersion: 1,

      [1]: (state) => {
        state.value = 'modified';
      },
    },
  );

  expect(result.value).toBe('modified');
  expect(result._migrationVersion).toBe(1);
});

test('applies many migrations if there are many pending', () => {
  // ARRANGE
  const result = migrate(
    {
      _migrationVersion: 0,
    },
    {
      migrationVersion: 4,

      [0]: (state) => {
        state.zero = true;
      },
      [1]: (state) => {
        state.one = true;
      },
      [2]: (state) => {
        state.two = true;
      },
      [3]: (state) => {
        state.three = true;
      },
      [4]: (state) => {
        state.four = true;
      },
      [5]: (state) => {
        state.five = true;
      },
    },
  );

  // ASSERT
  expect(result.zero).toBe(undefined);
  expect(result.one).toBe(true);
  expect(result.two).toBe(true);
  expect(result.three).toBe(true);
  expect(result.four).toBe(true);
  expect(result.five).toBe(undefined);
  expect(result._migrationVersion).toBe(4);
});

test('throws an error if there is no valid version', () => {
  // ARRANGE
  expect(() => {
    migrate(
      {
        _migrationVersion: '0',
      },
      {
        migrationVersion: 1,

        [1]: (state) => {
          state.zero = true;
        },
      },
    );
    // ASSERT
  }).toThrowError(`No migration version found`);
});

test('throws an error if there is no valid migration', () => {
  // ARRANGE
  expect(() => {
    migrate(
      {
        _migrationVersion: 0,
      },
      {
        migrationVersion: 1,

        [0]: (state) => {
          state.zero = true;
        },
      },
    );
    // ASSERT
  }).toThrowError('No migrator found for `migrationVersion` 1');
});

test('guarantees that the version number ends up correct', () => {
  // ARRANGE
  const result = migrate(
    {
      _migrationVersion: 0,
      value: 'untouched',
    },
    {
      migrationVersion: 1,
      [1]: (state) => {
        state.value = 'modified';
        state._migrationVersion = 5;
      },
    },
  );

  // ASSERT
  expect(result.value).toBe('modified');
  expect(result._migrationVersion).toBe(1);
});
