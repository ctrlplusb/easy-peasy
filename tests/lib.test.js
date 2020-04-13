import { get } from '../src/lib';

describe('get', () => {
  test('invalid target', () => {
    expect(get(['foo'], 12345)).toBeUndefined();
  });
});
