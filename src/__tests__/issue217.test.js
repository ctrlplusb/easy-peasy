import { action, computed, createStore } from '../index';

test('issue217', () => {
  const model = {
    items: {},

    nested: {
      numbers: [1, 2, 3],
      filteredNumbers: computed(state => {
        return state.numbers.filter(number => number > 1);
      }),
    },

    // selectors
    list: computed(items => Object.values(items), [state => state.items]),

    // actions
    fetched: action((state, payload) => {
      state.items = payload.reduce((acc, todo) => {
        acc[todo.id] = todo;
        return acc;
      }, {});
    }),
  };

  const store = createStore(model);

  // act
  store.getActions().fetched([{ id: 1, text: 'foo' }]);

  // assert
  expect(store.getState().nested.filteredNumbers).toEqual([2, 3]);
});
