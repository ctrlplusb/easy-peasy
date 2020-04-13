import {
  createTypedHooks,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStore,
} from '../src';

test('exports all hooks', () => {
  // act
  const typedHooks = createTypedHooks();

  // assert
  expect(typedHooks.useStoreActions).toBe(useStoreActions);
  expect(typedHooks.useStoreState).toBe(useStoreState);
  expect(typedHooks.useStoreDispatch).toBe(useStoreDispatch);
  expect(typedHooks.useStore).toBe(useStore);
});
