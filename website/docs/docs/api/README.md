---
sidebarDepth: 2
---

# API

This sections provides you with a full overview of the API provided by Easy Peasy. Even if you have been through the tutorial we highly recommend that you review this section as the tutorial does not cover the full API surface area as well as all the features available via each helper.

Below is an overview of the entire API. See the related API pages for details and parameters specifications.


## Hook Usage Overview

These hooks are how you interact with the store from your React components.

### [useStoreState](/docs/api/use-store-state)

This hook is similar to using React-Redux to access store data.

````javascript
import { useStoreState } from 'easy-peasy';

const todos = useStoreState(state => state.todos.items);
todos.forEach(...);
````

### [useStoreActions](/docs/api/use-store-actions)

Calling an action method is similar to dispatching an action, 
except it _combines_ action-name, action-creator and reducer into a single function.

````javascript
import { useStoreActions } from 'easy-peasy';

const addTodo = useStoreActions(actions => actions.todos.add);
addTodo({ text: 'Do something' });
````

### [useStoreDispatch](/docs/api/use-store-dispatch)

The dispatch hook provides backward compatibility for old reducers or middleware integration.
You may never need to use this hook in your app.

````javascript
import { useStoreDispatch } from 'easy-peasy';

dispatch({ type: 'ADD_TODO', payload: { text: 'Do something' } })
````

## Store Model Overview

You create a model for the store using these patterns and helpers.
Individual model-objects can be combined to create the complete store-model.


### [Values](/docs/api/create-store)

Access model Values with `useStoreState()`.
Models can contain any type of value that Redux supports.

````javascript
const todosModel = {
  items: [],
  data: {}
  name: 'Todos',
  lastUpdated: new Date()
});
````

### [computed()](/docs/api/computed) &nbsp; (getter value)

Access Computed-values with `useStoreState()`.

````javascript
const todosModel = {
  items: [],

  itemsCount: computed(state => state.items.length)
});
````

### [action()](/docs/api/action) &nbsp; (synchronous setter)

Access Actions with `useStoreActions()`.
Actions are the primary way to update state.

````javascript
const todosModel = {
  items: [],

  addTodo: action((state, payload) => {
    state.items.push(payload);
  })
};
````

### [thunk()](/docs/api/thunk) &nbsp; (synchronous or asynchronous setter)

Access Thunk-actions with `useStoreActions()`.
Thunks cannot modify state directly, but can call one or more 'actions' to do so.

````javascript
const todosModel = {
  items: [],
 
  addTodo: action((state, payload) => {
    state.items.push(payload);
  }),

  saveTodo: thunk(async (actions, payload) => {
    const todo = await postTodo(payload);
    actions.addTodo(todo);
  })
};
````

### [actionOn()](/docs/api/action-on) &nbsp; (listener - synchronous setter)

Action-listeners are triggered automatically so are never called directly.

````javascript
const todosModel = {
  items: [],
  auditLog: [],

  addTodo: action((state, payload) => {
    state.items.push(payload);
  }),

  onAddTodo: actionOn(
    // targetResolver:
    actions => actions.addTodo,
    // handler:
    (state, target) => {
      state.auditLog.push(`Added a todo: ${target.payload}`);
    }
  )
};
````

### [thunkOn()](/docs/api/thunk-on) &nbsp; (listener - synchronous or asynchronous setter)

Action-listeners are triggered automatically so are never called directly.

````javascript
const todosModel = {
  items: [],
  auditLog: [],

  addTodo: action((state, payload) => {
    state.items.push(payload);
  }),

  addLogItem: (state, payload) => {
    state.auditLog.push(`Added a todo: ${payload}`);
  }

  onAddTodo: thunkOn(
    // targetResolver:
    actions => actions.addTodo,
    // handler:
    async (actions, target) => {
      const savedTodo = await postTodo(target.payload);
      actions.addLogItem(`Added a todo: ${savedTodo}`);
    }
  )
};
````

### [reducer()](/docs/api/reducer) &nbsp; (synchronous setter)

Provides a way to transition ordinary reducers into Easy-Peasy,
and to handle ordinary dispatched actions.
New code should use [actions](/docs/api/action) instead of reducers.

````javascript
const todosModel = {
  items: [],

  reducer((state, action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return { items: [...state.items].push(payload) };
      default: 
        return state;
    }
  })
};
````


## Store Creation and Implementation

### [createStore()](/docs/api/store)

Creates the enhanced Easy-Peasy Redux-store.

````javascript
import { createStore } from 'easy-peasy';

const store = createStore(model);
````

### [storeConfig](/docs/api/store-config) { }

Configuration object to customize a store

````javascript
import { createStore } from 'easy-peasy';

const storeConfig = { ... };
const store = createStore(model, storeConfig);
````

### [&lt;StoreProvider&gt;](/docs/api/store-provider)

Makes the store available in your app.
Equivalent to the React-Redux `<Provider>` component.

````javascript
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model'

const store = createStore(model);

function App() {
  return (
    <StoreProvider store={store}>
      <TodoList />
    </StoreProvider>
  );
}
````


## Helpers

### [memo()](/docs/api/memo)

A memoization helper. The same one used internally by Easy-Peasy.

````javascript
import { memo } from 'easy-peasy';

const memoizedFunction = memo(myFunction, 2);
````

### [debug()](/docs/api/memo)

A helper to convert the immutable `state` object to an ordinary object for debugging.

````javascript
import { debug } from 'easy-peasy';

const todosModel = {
  addTodo: action((state, payload) => {
    console.log('todo', debug(state)); // 👈 outputs ordinary todo object
  })
}
````

