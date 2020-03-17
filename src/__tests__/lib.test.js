import get from '../lib/get';

describe('get', () => {
  test('invalid target', () => {
    expect(get(['foo'], 12345)).toBeUndefined();
  });
});
