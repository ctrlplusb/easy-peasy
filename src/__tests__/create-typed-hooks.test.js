import {
  createTypedHooks,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
} from '../index';

test('exports all hooks', () => {
  // act
  const typedHooks = createTypedHooks();

  // assert
  expect(typedHooks.useStoreActions).toBe(useStoreActions);
  expect(typedHooks.useStoreState).toBe(useStoreState);
  expect(typedHooks.useStoreDispatch).toBe(useStoreDispatch);
});
