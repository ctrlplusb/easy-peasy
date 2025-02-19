import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Action,
  createStore,
  State,
  StoreProvider,
  createTypedHooks,
} from 'easy-peasy';
import { connect } from 'react-redux';
import { createRoot } from 'react-dom/client';

interface StoreModel {
  items: Array<string>;
  addTodo: Action<StoreModel, string>;
}

const model: StoreModel = {} as any;

const store = createStore(model);

const { useStoreState, useStoreActions, useStoreDispatch } =
  createTypedHooks<StoreModel>();

function MyComponent() {
  const items = useStoreState((state) => state.items);
  const addTodo = useStoreActions((actions) => actions.addTodo);
  addTodo('Install easy peasy');
  const dispatch = useStoreDispatch();
  dispatch({
    type: 'ADD_FOO',
    payload: 'bar',
  });
  return (
    <div>
      {items.map((item) => (
        <div>{`Todo: ${item}`}</div>
      ))}
    </div>
  );
}

const root = createRoot(document.createElement('div'));
root.render(
  <StoreProvider store={store}>
    <MyComponent />
  </StoreProvider>,
);

/**
 * We also support typing react-redux
 */
const Todos: React.FC<{ todos: string[] }> = ({ todos }) => (
  <div>Count: {todos.length}</div>
);

connect((state: State<StoreModel>) => ({
  items: state.items,
}))(Todos);
