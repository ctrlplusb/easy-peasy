import {
  createTypedHooks,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStore,
} from '../src';

test('exports all hooks', () => {
  // ACT
  const typedHooks = createTypedHooks();

  // ASSERT
  expect(typedHooks.useStoreActions).toBe(useStoreActions);
  expect(typedHooks.useStoreState).toBe(useStoreState);
  expect(typedHooks.useStoreDispatch).toBe(useStoreDispatch);
  expect(typedHooks.useStore).toBe(useStore);
});
