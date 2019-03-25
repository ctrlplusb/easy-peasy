import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from 'react-testing-library';

import { action, createStore, useStore, StoreProvider } from '../index';

test('issue#136', async () => {
  // arrange
  const store = createStore({
    items: {
      a: { id: 'a', name: 'A' },
      b: { id: 'b', name: 'B' },
      c: { id: 'c', name: 'C' },
    },
    deleteB: action(state => {
      delete state.items.b;
    }),
  });

  const ListItem = ({ id }) => {
    const { name } = useStore(s => s.items[id], [id]);
    return name;
  };

  function App() {
    const itemIds = useStore(s => Object.keys(s.items));
    const items = itemIds.map(id => <ListItem key={id} id={id} />);
    return <div data-testid="items">{items}</div>;
  }

  const app = (
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  );

  const { rerender, getByTestId } = render(app);

  expect(getByTestId('items').innerHTML).toBe('ABC');

  act(() => {
    store.dispatch.deleteB();
  });

  rerender(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  expect(getByTestId('items').innerHTML).toBe('AC');

  await new Promise(resolve => setTimeout(resolve, 1000));
});
