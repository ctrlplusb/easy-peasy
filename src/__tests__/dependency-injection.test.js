import { createStore, thunk, model } from '../index';

test('exposes dependencies to effect actions', async () => {
  // arrange
  const injection = jest.fn();
  const store = createStore(
    model({
      doSomething: thunk((actions, payload, { injections }) => {
        injections.injection();
      }),
    }),
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
