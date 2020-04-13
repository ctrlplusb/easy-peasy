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

interface StoreModel {
  items: Array<string>;
  addTodo: Action<StoreModel, string>;
}

// @ts-ignore
const model: StoreModel = {};

const store = createStore(model);

const { useStoreState, useStoreActions, useStoreDispatch } = createTypedHooks<
  StoreModel
>();

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

ReactDOM.render(
  <StoreProvider store={store}>
    <MyComponent />
  </StoreProvider>,
  document.createElement('div'),
);

/**
 * We also support typing react-redux
 */
const Todos: React.SFC<{ todos: string[] }> = ({ todos }) => (
  <div>Count: {todos.length}</div>
);

connect((state: State<StoreModel>) => ({
  items: state.items,
}))(Todos);
