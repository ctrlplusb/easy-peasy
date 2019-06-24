import { action, computed, createStore } from '../index';

test('issue217', () => {
  const model = {
    items: {
      1: 'foo',
    },

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
      state.nested.numbers = payload;
      state.items['1'] = 'bar';
    }),
  };

  const store = createStore(model);

  // act
  store.getActions().fetched([4, 5, 6]);

  // assert
  expect(store.getState().nested.filteredNumbers).toEqual([4, 5, 6]);
  expect(store.getState().list).toEqual(['bar']);
});
