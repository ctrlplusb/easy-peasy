import { createStore, thunk } from '../src';

test('exposes dependencies to effect actions', async () => {
  // arrange
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

  // act
  await store.getActions().doSomething();

  // assert
  expect(injection).toHaveBeenCalledTimes(1);
});
