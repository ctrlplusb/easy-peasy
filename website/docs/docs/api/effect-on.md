# effectOn

Allows you to declare an effect within your model which will execute every time
the targeted state changes. Think of it as a thunk that automatically fires when
specific state changes.

- [effectOn](#effecton)
  - [API](#api)
    - [Arguments](#arguments)
  - [Tutorial](#tutorial)
    - [Introduction](#introduction)
    - [Execution behaviour](#execution-behaviour)
    - [How state changes are determined](#how-state-changes-are-determined)
    - [Utilising a dispose function](#utilising-a-dispose-function)
  - [Limitations](#limitations)

## API

The `effectOn` function is described below.

### Arguments

- `stateResolvers` (Array\<Function\>)

  State resolvers allows you to isolate the specific parts of your state that
  your effect will track. Each state resolver function receives the following
  arguments:

  - `state` (Object)

    The local state against which your [effectOn](/docs/api/effect-on.html)
    property is bound.

  - `storeState` (Object)

    The entire store state

- `handler` (Function, _required_)

  The `handler` that will execute the desired effect. It can be asynchronous,
  and receives the following arguments:

  - `actions` (Object)

    The [actions](/docs/api/action.html) that are local to the thunk. This
    allows you to dispatch an [action](/docs/api/action.html) to update state
    should you require.

  - `change` (Object)

    Represents the change that took place, causing the effect to run. It
    contains the following properties:

    - `prev` (Array\<any\>)

      The previous state that was mapped by your `stateResolvers`.

    - `current`(Array\<any\>)

      The current state that was mapped by your `stateResolvers` after the
      change in state occurred.

    - `action` (Object)

      An object representing information about the action that caused the
      change. It contains the following properties:

      - `type` (string)

        The action identifer.

      - `payload` (any)

        The payload, if there was one, that was attached to the action.

  - `helpers` (Object)

    Helpers which may be useful for more advanced effect implementations. The
    object contains the following properties:

    - `dispatch` (Function)

      The Redux dispatch function, allowing you to dispatch "standard" Redux
      actions.

    - `getState` (Function)

      When executed it will provide the state that is local to the thunk.

      > Note: whilst you are able to access the store's state via this API your
      > effect should not perform any mutation of this state. That would be
      > considered an anti-pattern. All state updates must be contained within
      > [actions](/docs/api/action.html). This API exists within a thunk purely
      > for convenience sake - allowing you to perform logic based on the
      > existing state.

    - `getStoreActions` (Function)

      When executed it will get the actions across your entire store.

      We don't recommend dispatching actions like this, and invite you to
      consider creating an [actionOn](/docs/api/action-on.html) or
      [thunkOn](/docs/api/thunk-on.html) listener instead.

    - `getStoreState` (Function)

      When executed it will provide the entire state of your store.

      > Note: whilst you are able to access the store's state via this API your
      > thunk should not perform any mutation of this state. That would be
      > considered an anti pattern. All state updates must be contained within
      > actions. This API exists within a thunk purely for convenience sake -
      > allowing you to perform logic based on the existing state.

    - `injections` (Any, default=undefined)

      Any dependencies that were provided to the `createStore` configuration
      will be exposed via this argument. See the
      [StoreConfig](/docs/api/store-config.html) documentation on how to provide
      them to your store.

    - `meta` (Object)

      This object contains meta information related to the thunk. Specifically
      it contains the following properties:

      - parent (Array)

        An array representing the path of the parent against which the thunk was
        attached within your model.

      - path (Array)

        An array representing the full path to the thunk based on where it was
        attached within your model.

  The `handler` allows you to return a
  [`dispose` function](#utilising-a-dispose-function). The `dispose` function
  can be asynchronous or synchronous and will be executed prior to the next
  execution. Please read the [docs](#utilising-a-dispose-function) on this
  feature.

## Tutorial

### Introduction

Two arguments are provided to [effectOn](/docs/api/effect-on.html); namely the
`stateResolvers` and the `handler`. The `stateResolvers` are an array of
functions which should resolve the target state that should be tracked. When the
tracked state changes the `handler` function is executed..

The `handler` can be _asynchronous_ or _synchronous_. It receives the
[store](/docs/api/store.html) actions, a `change` object containing the `prev`
values for the targeted state and the `current` values as well as the `action`
that caused the change in state. It additionally receives a `helper` argument
allowing you to access the [store](/docs/api/store.html) state etc.

The `handler` additionally allows you to return a dispose function, which will
be executed prior to the next execution of the `handler`. This can be useful in
performing things like API call cancellation etc.

```javascript
import { effectOn } from 'easy-peasy';

const todosModel = {
  items: [],
  saving: false,
  setSaving: action((state, payload) => {
    state.saving = payload;
  }),
  effectOn(
    // Provide an array of "stateResolvers" to resolve the targeted state:
    [state => state.items],
    // Provide a handler which will execute every time the targeted state changes:
    async (actions, change) => {
      const [items] = change.current;
      actions.setSaving(true);
      await todosService.save(items);
      actions.setSaving(false);
    }
  )
};
```

### Execution behaviour

In regards to the execution of your effect; should the targeted state change
multiple times your effect will be executed for each state change. This means
that it is possible to have multiple executions of your effect running
concurrently, especially in the case of long running _asynchronous_ effects.

Each effect execution will **_not wait_** for any **_prior executions_** to
complete. Should you desire something like this you could look to implement a
[debounce](https://github.com/component/debounce) within your effect handler.

Alternatively, you could make use of the [dispose](utilising-a-dispose-function)
in order to clean up effect executions should a new execution begin. Please read
the [docs](utilising-a-dispose-function) on this feature.

### How state changes are determined

Strict equality checking is used (i.e. `prevState === currentState`) when
determining if the targeted state has changed.

It is important you resolve the _actual_ state from your store, and don't create
additional wrapper objects/arrays within the state resolvers. If you did so it
would break the strict equality checking, causing your effects to run for
_every_ change to the store.

This anti-pattern can be illustrated below:

```javascript
const myModel = {
  one: 'one',
  two: 'two',
  effectOn(
    [
      (state) => {
        // This is an anti-pattern. You are returning a new object instance
        // for every execution. This will result in the effect running for
        // _every_ state change.
        //    👇
        return {
          one: state.one,
          two: state.two
        };
      }
    ],
    (actions, change) => {
      console.log('I run for every change to the store!');
    }
  )
};
```

Instead you should resolve each piece of state individually:

```javascript
const myModel = {
  one: 'one',
  two: 'two',
  effectOn(
    [
      // 👍
      (state) => state.one,
      (state) => state.two
    ],
    (actions, change) => {
      console.log('I only run when "one" or "two" have changed');
    }
  )
};
```

### Utilising a dispose function

An effect can return a `dispose` function, which will be executed should a newer
execution of the effect occur due to another state change and the previous
effect execution has not yet completed. This provides a mechanism by which you
can clean up resource hooks or cancel API calls.

```javascript
import { effectOn } from 'easy-peasy';

const todosModel = {
  items: [],
  effectOn(
    [state => state.items],
    (actions, change) => {
      const [items] = change.current;
      const request = todosService.save(items);
      // Return a dispose function to abort the current save call prior to
      // executing the handler again.
      //     👇
      return () => request.abort();
    }
  )
};
```

The `dispose` function **_must always be return synchronously_** from your
effect, whilst the effect can still execution _asynchronous_ code internally.
This restriction allows us to execute your `dispose` function as early as
possible should a new effect execution begin. The example below illustrates the
anti-pattern of resolving the `dispose` asynchronously.

```javascript
effectOn(
  [(state) => state.items],
  // We are using async/await, therefore our dispose is now resolved
  // asynchronously via the implicitly returned Promise.
  // 👇
  async (actions, change) => {
    const [items] = change.current;
    const request = await todosService.save(items);
    return () => request.abort();
  },
);
```

Also note in the above example that as we are awaiting on the
`todosService.save` call it will always be resolved prior to the dispose being
returned.

## Limitations

- Effects cannot be dispatched directly - e.g. the `useStoreActions` hook will
  not include effects.
- Effect execution timing is not guaranteed. It's best to consider them as
  asynchronous operations where you are unable to attach external logic against
  their resolution.
