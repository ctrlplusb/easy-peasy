# createContextStore

Creates a store powered by context, allowing you to expose state to specific parts of your React application.

Using this approach over the global [createStore](#createstore) approach allows you to create multiple stores. Each store can encapsulate differing state needs for branches/features of your application. This may be especially useful for larger scale applications, or when employing code splitting techniques.

```javascript
const Counter = createContextStore({
  count: 0,
  increment: action(state => {
    state.count += 1;
  })
})
```

## Arguments

The following arguments are accepted:

  - `model` (Object | (initialData: any) => Object, required)

    The model representing your store.

    Alternatively this can be a function that accepts `initialData`. The `initialData` can be provided as a prop to the `Provider`. This allows additional runtime configuration/overrides against your model.

  - `config` (Object, not required)

    Custom configuration for your store. Please see the [StoreConfig](/docs/api/store-config.html) API documentation for a full list of configuration options.

## Returns

When executed you will receive a store container that contains the following properties:

 - `Provider` (Component, required)

   The React component that allows you to wrap a specific part of your React app in order to expose the store state to it. You can wrap as much or as little of your React app as you like.

   If you render multiple instances of this provider component each instance will have it's own unique state. This may be handy in some cases, but in most cases you will likely only have one instance of your provider rendered.

   ```javascript
   <Counter.Provider>
    <App />
   </Counter.Provider>
   ```

   The provider accepts the following props:

   - `initialData` (Any, not required)

     Allows you to provide additional data used to initialise your store's model.  This needs to be used in conjunction with the function form of defining your  model.

     ```javascript
     <Counter.Provider initialData={{ count: 1 }}>
       <App />
     </Counter.Provider>
     ```

 - `useStoreState` (Function, required)

   A hook allowing you to access the state of your store.

   ```javascript
   function CountDisplay() {
     const count = Counter.useStoreState(state => state.count);
     return <div>{count}</div>
   }
   ```

   This hook shares all the same properties and features of the global [`useStoreState`](/api/docs/use-store-state.html) hook.

 - `useStoreActions` (Function, required)

   A hook allowing you to access the actions of your store.

   ```javascript
   function CountIncButton() {
     const increment = Counter.useStoreActions(actions => actions.increment);
     return <button onClick={increment}>+</button>
   }
   ```

   This hook shares all the same properties and features of the global [`useStoreActions`](/api/docs/use-store-actions.html) hook.

 - `useStoreDispatch` (Function, required)

   A hook allowing you to access the dispatch of your store.

   ```javascript
   function CountIncButton() {
     const dispatch = Counter.useStoreDispatch();
     return <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
   }
   ```

   This hook shares all the same properties and features of the global [`useStoreDispatch`](/api/docs/use-store-dispatch.html) hook.

 - `useStoreRehydrated` (Function, required)

   A hook allowing you to access the rehydration status of the store. Only useful when utilising [`persist`](/docs/api/persist.html) within your model.

   ```javascript
   function App() {
     const rehydrated = Counter.useStoreRehydrated();
     return rehydrated ? <div>My App</div> : <div>Loading...</div>;
   }
   ```

   This hook shares all the same properties and features of the global [`useStoreRehydrated`](/api/docs/use-store-rehydrated.html) hook.

 - `useStore` (Function, required)

   A hook allowing you to access the store. We recommend that this only be used within exceptional use cases.

   ```javascript
   function MyCounter() {
     const store = Counter.useStore();
     store.getState();
     return null;
   }
   ```

   This hook shares all the same properties and features of the global [`useStore`](/api/docs/use-store.html) hook.

## Example

This examples shows how to create a context store and integrate it with your React application.

```javascript
const Counter = createContextStore({
  count: 0,
  inc: action(state => {
    state.count += 1;
  })
})

function MyCounter() {
  const count = Counter.useStoreState(state => state.count);
  const actions = Counter.useActions(actions => actions.inc);
  return (
    <>
      <div>{count}</div>
      <button onClick={() => actions.inc()} type="button"> + </button>
    </>
  )
}

ReactDOM.render(
  <Counter.Provider>
    <MyCounter />
  </Counter.Provider>,
  document.querySelector('#app')
);
```

## Using multiple stores

This example demonstrates how you can use multiple context stores within your React application.

```javascript
const Counter = createContextStore({
  count: 0,
  inc: action(state => {
    state.count += 1;
  })
})

const Todos = createContextStore({
  items: [],
  addTodo: action((state, text) => {
    state.items.push(text)
  })
})

ReactDOM.render(
  <>
    <Counter.Provider>
      <CounterApp />
    </Counter.Provider>
    <Todos.Provider>
      <TodosApp />
    </Todos.Provider>
  </>,
  document.querySelector('#app')
);
```

## Nesting multiple stores

This example shows how you can nest multiple context stores.

```javascript
const Counter = createContextStore({
  count: 0,
  inc: action(state => {
    state.count += 1;
  })
})

const Todos = createContextStore({
  items: [],
  addTodo: action((state, text) => {
    state.items.push(text)
  })
})

ReactDOM.render(
  <Counter.Provider>
    <Todos.Provider>
      <App />
    </Todos.Provider>
  </Counter.Provider>,
  document.querySelector('#app')
);
```

## Customising your model at runtime

This example shows how you can use the `initialData` prop of your context store's `Provider` in order to customise your model at runtime.

```javascript
// The initial data will be received here
//                                      👇
const Counter = createContextStore(initialData => ({
  count: initialData.count,
  inc: action(state => {
    state.count += 1;
  })
}));

ReactDOM.render(
  // Provide some initial data to your model instantiation
  //                                 👇
  <Counter.Provider initialData={{ count: 1 }}>
    <CounterApp />
  </Counter.Provider>,
  document.querySelector('#app')
);
```
