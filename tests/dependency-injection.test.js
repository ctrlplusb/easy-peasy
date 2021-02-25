import { createStore, thunk } from '../src';

test('exposes dependencies to effect actions', async () => {
  // ARRANGE
  const injection = jest.fn();
  const store = createStore(
    {
      doSomething: thunk((actions, payload, { injections }) => {
        injections.injection();
      }),
    },
    {
      injections: {
        injection,
      },
    },
  );

  // ACT
  await store.getActions().doSomething();

  // ASSERT
  expect(injection).toHaveBeenCalledTimes(1);
});
