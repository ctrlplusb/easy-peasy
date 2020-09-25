# createContextStore

Creates a store powered by context, allowing you to expose state to specific
parts of your React application.

Using this approach over the global [createStore](#createstore) approach allows
you to create multiple stores. Each store can encapsulate differing state needs
for branches/features of your application. This may be especially useful for
larger scale applications, or when employing code splitting techniques.

- [Tutorial](#tutorial)
  - [Creating a context store](#creating-a-context-store)
  - [Binding to your application](#binding-to-your-application)
  - [Consuming state from the store](#consuming-state-from-the-store)
  - [Defining injections at runtime](#defining-injections-at-runtime)
- [API](#api)
  - [Arguments](#arguments)
  - [Returns](#returns)

## Tutorial

This section will provide you with step by step instructions on how to create
and consume a context store within your application.

It will not exhaustively cover how to create your model or utilise all of the
hooks. Please reference the respective docs to gain a deeper understanding of
those APIs.

### Creating a context store

Firstly create your context store, defining it's model:

```javascript
import { createContextStore } from 'easy-peasy';

const CounterStore = createContextStore({
  count: 0,
  increment: action((state) => {
    state.count += 1;
  }),
});

export default CounterStore;
```

### Binding to your application

In order to use the store within your application you firstly need to identify
the components within your application that you wish to have access to the
store.

Once you have done this wrap the component(s) with the store's `Provider`.

```javascript
import CounterStore from './stores/counter';

function MyApp() {
  return (
    <>
      <Header />
      {/* 👇 exposing store to our Main component */}
      <CounterStore.Provider>
        <Main />
      </CounterStore.Provider>
      <Footer />
    </>
  );
}
```

### Consuming state from the store

Any components that have been wrapped with the store's `Provider` will be able
to utilise the store's `useStoreState` hook to access state.

```javascript
import CounterStore from './stores/counter';

function Main() {
  // Access the store's state via the hook
  //                              👇
  const count = CounterStore.useStoreState((state) => state.count);

  return <main>Current count is: {count}</main>;
}
```

### Dispatching actions from the store

Any components that have been wrapped with the store's `Provider` will be able
to utilise the store's `useStoreActions` hook to access actions.

```javascript
import CounterStore from './stores/counter';

function Main() {
  const count = CounterStore.useStoreState((state) => state.count);
  // Access the store's actions via the hook
  //                                  👇
  const increment = CounterStore.useStoreActions(
    (actions) => actions.increment,
  );

  return (
    <main>
      Current count is: {count}
      {/* Dispatch the action   👇  */}
      <button onClick={() => increment()}>+</button>
    </main>
  );
}
```

### Defining injections at runtime

It is possible to provide the store injections at runtime. In order to do so you
can provide them the store's `Provider`.

```javascript
import CounterStore from './stores/counter';

function MyApp({ language }) {
  // Imagine we had a value that changes at runtime, which we intend to use
  // as an injection into our application
  const translator = useTranslator(language);

  return (
    <>
      <Header />
      {/* pass down the injections into the provider
                                               👇  */}
      <CounterStore.Provider injections={{ translator }}>
        <Main />
      </CounterStore.Provider>
      <Footer />
    </>
  );
}
```

This will override any previous injections that were defined when creating the
store. If you wish to instead update the existing injections you can utilise the
function form.

```javascript
import CounterStore from './stores/counter';

function MyApp({ language }) {
  // Imagine we had a value that changes at runtime, which we intend to use
  // as an injection into our application
  const translator = useTranslator(language);

  return (
    <>
      <Header />
      <CounterStore.Provider
        {/* Pass down a function into the injections.
            It receives the previous injections.
                          👇 */}
        injections={(previousInjections) => ({
          // Spread the existing inject values so we can keep them:
          ...previousInjections,
          // Then overwrite the "translator":
          translator,
        })}
      >
        <Main />
      </CounterStore.Provider>
      <Footer />
    </>
  );
}
```

## API

This function can be imported like so:

```javascript
import { createContextStore } from 'easy-peasy';
```

### Arguments

The following arguments are accepted:

- `model` (Object, _required_)

  The model representing your store.

- `config` (Object, _optional_)

  Custom configuration for your store. Please see the
  [StoreConfig](/docs/api/store-config.html) API documentation for a full list
  of configuration options.

### Returns

When executed you will receive a store container that contains the following
properties:

- `Provider` (Component)

  The React component that allows you to wrap a specific part of your React app
  in order to expose the store state to it. You can wrap as much or as little of
  your React app as you like.

  If you render multiple instances of this provider component each instance will
  have it's own unique state. This may be handy in some cases, but in most cases
  you will likely only have one instance of your provider rendered.

  ```javascript
  <Counter.Provider>
    <App />
  </Counter.Provider>
  ```

  The provider accepts the following props:

  - `injections` (Object || (previousInjections) => Object, _optional_)

    Allows you to provide additional data used to initialise your store's model.
    This needs to be used in conjunction with the function form of defining your
    model.

    ```javascript
    <Counter.Provider injections={{ translator }}>
      <App />
    </Counter.Provider>
    ```

    _or_

    ```javascript
    <Counter.Provider
      initialData={(previousInjections) => ({
        ...previousInjections,
        translator,
      })}
    >
      <App />
    </Counter.Provider>
    ```

- `useStoreState` (Function)

  A hook allowing you to access the state of your store.

  ```javascript
  function CountDisplay() {
    const count = Counter.useStoreState((state) => state.count);
    return <div>{count}</div>;
  }
  ```

  This hook shares all the same properties and features of the global
  [`useStoreState`](/api/docs/use-store-state.html) hook.

- `useStoreActions` (Function)

  A hook allowing you to access the actions of your store.

  ```javascript
  function CountIncButton() {
    const increment = Counter.useStoreActions((actions) => actions.increment);
    return <button onClick={increment}>+</button>;
  }
  ```

  This hook shares all the same properties and features of the global
  [`useStoreActions`](/api/docs/use-store-actions.html) hook.

- `useStoreDispatch` (Function)

  A hook allowing you to access the dispatch of your store.

  ```javascript
  function CountIncButton() {
    const dispatch = Counter.useStoreDispatch();
    return <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>;
  }
  ```

  This hook shares all the same properties and features of the global
  [`useStoreDispatch`](/api/docs/use-store-dispatch.html) hook.

- `useStoreRehydrated` (Function)

  A hook allowing you to access the rehydration status of the store. Only useful
  when utilising [`persist`](/docs/api/persist.html) within your model.

  ```javascript
  function App() {
    const rehydrated = Counter.useStoreRehydrated();
    return rehydrated ? <div>My App</div> : <div>Loading...</div>;
  }
  ```

  This hook shares all the same properties and features of the global
  [`useStoreRehydrated`](/api/docs/use-store-rehydrated.html) hook.

- `useStore` (Function)

  A hook allowing you to access the store. We recommend that this only be used
  within exceptional use cases.

  ```javascript
  function MyCounter() {
    const store = Counter.useStore();
    store.getState();
    return null;
  }
  ```

  This hook shares all the same properties and features of the global
  [`useStore`](/api/docs/use-store.html) hook.
