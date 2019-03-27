import { createStore, action, listen, thunk } from '../index';

test('issue#139', done => {
  // arrange
  const model = {
    part1: {
      counter1: 0,
      incrementCounter: action(s => {
        s.counter1 += 1;
      }),
    },
    part2: {
      counter2: 100,
      set: action((state, payload) => {
        state.counter2 = payload;
      }),
      dependent: listen(on => {
        on(
          model.part1.incrementCounter,
          thunk(async (actions, payload, { getStoreState }) => {
            const { counter1 } = getStoreState().part1;

            // assert
            expect(counter1).toEqual(1);

            done();
          }),
        );
      }),
    },
  };
  const store = createStore(model);

  // act
  store.dispatch.part1.incrementCounter();
});
