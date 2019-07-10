# listeners

This is the shared documentation for the [actionOn](/docs/api/action-on) and [thunkOn](/docs/api/thunk-on) APIs. Both APIs allow you to declare a listener, which gets executed in response to configured actions having been executed.

The [actionOn](/docs/api/action-on) API allows you to declare a listener which will be used to update state, much like a standard [action](/docs/api/action). It shares the same characteristics as an [action](/docs/api/action), so we recommend that you are familiar with [actions](/docs/api/action).

The [thunkOn](/docs/api/thunk-on) API allows you to declare a listener which will be used to perform side effects, much like a standard [thunk](/docs/api/thunk). It shares the same characteristics as a [thunk](/docs/api/thunk), so we recommend that you are familiar with [thunks](/docs/api/thunk).

Whilst [actionOn](/docs/api/action-on) and [thunkOn](/docs/api/thunk-on) are similar to [action](/docs/api/action) and [thunk](/docs/api/thunk) respectively they do have the following distinctions:

1. They require you define a `targetResolver` function as the first argument to your *listener* definitions. The `targetResolver` will receive the store actions and is responsible for resolving the target(s) to listen to.
2. The handler for the action/thunk listener will receive a `target` argument instead of a `payload` argument. This `target` argument is an object containing a lot of useful information about the target being handled, including the payload.

We will cover of both of these points in more detail below, but first, let's provide a brief example of each of the APIs.

## actionOn

A *listener* action is responsible for performing updates to state in response to configured *targets* being executed.

```javascript
onAddTodo: actionOn(
  // targetResolver:
  actions => actions.addTodo,
  // handler:
  (state, target) => {
    state.auditLog.push(`Added a todo: ${target.payload}`);
  }
)
```

## thunkOn

A *listener* thunk is responsible for performing side effects (e.g. a call to an HTTP endpoint) in response to configured *targets* being executed.

```javascript
onAddTodo: thunkOn(
  // targetResolver:
  actions => actions.addTodo,
  // handler:
  async (actions, target) => {
    await auditService.add(`Added a todo: ${target.payload}`);
  }
)
```

## `targetResolver`

The first argument you provide to a *listener* definition is the `targetResolver` function. This function will receive the following arguments:

- `actions` (Object)

  The local actions relating to where your *listener* is bound on your model.

- `storeActions` (Object)

  All of the actions for the entire store.

The function should then resolve one of the following:

- An action

   ```javascript
   actions => actions.addTodo
   ```

- A thunk

   ```javascript
   actions => actions.saveTodo
   ```

- The explicit string type of the action to listen to

  ```javascript
  actions => 'ROUTE_CHANGED'
  ```

- An array of actions/thunks/strings

  ```javascript
  actions => [
    actions.saveTodo,
    'ROUTE_CHANGED'
  ]
  ```

## `target` Argument

The `target` argument that a *listener* handler receives contains the following properties:

- `type` (string)

  The type of the target action being responded to. e.g. `"@actions.todos.addTodo"`

- `payload` (any)

  This will contain the same payload of the target action being responded to.

- `result` (any | null)

  When listening to a thunk, if the thunk succeeded and returned a result, the result will be contained within this property.

- `error` (Error | null)

  When listening to a thunk, if the thunk failed, this property will contain the `Error`.

- `resolvedTargets` (Array\<string\>)

  An array containing a list of the resolved targets, resolved by the `targetResolver` function. This aids in performing target based logic within a listener handler.

## Listening to thunks

In the examples above the listeners were configured to listen to an [action](https://easy-peasy.now.sh/docs/api/action).

You can just as easily target a [thunk](https://easy-peasy.now.sh/docs/api/thunk).

```javascript
onAddTodo: actionOn(
  actions => actions.saveTodo, // 👈 targeting a thunk
  (state, target) => {
    if (target.error) {
      state.auditLog.push(`Failed to save a todo: ${target.error.message}`);
    } else {
      state.auditLog.push(`Saved a todo: ${target.payload}`);
    }
  }
)
```

When you listen to a [thunk](https://easy-peasy.now.sh/docs/api/thunk) your *listener* will be fired any time the target [thunk](https://easy-peasy.now.sh/docs/api/thunk) succeeds or fails.

If the [thunk](https://easy-peasy.now.sh/docs/api/thunk) failed the `error` property of the `target` argument will be populated.

If the [thunk](https://easy-peasy.now.sh/docs/api/thunk) succeeded and returns a value, then the `result` property of the `target` argument will be populated with the returned value.

## Listening to multiple actions

A *listener* can have multiple *targets*. To aid having logic specific to each target type, both the `actionOn` and `thunkOn` handlers will receive a `resolvedTargets` array contained within the `target` object.

The `resolvedTargets` array contains the list of the action types resolved by the `targetResolver` function you provided to the *listener*. This array will match the index order of the types resolved by the `targetResolver`.

```javascript
const auditModel = {
  logs: [],
  onCriticalAction: actionOn( // Resolved targets, by array index
    (actions, storeActions) => [ //         👇
      storeActions.session.loggedIn,  // 👈 0
      storeActions.session.loggedOut, // 👈 1
      storeActions.todos.addedTodo,   // 👈 2
    ],
    (state, target) => {
      // The target argument will additionally contain a "resolvedTargets"
      // property, being an array containing all the types of the resolved
      // targets. This allows you to easily pull out these type references and
      // then perform target based logic against them.
      // Note how the array index of each type matches the array index as
      // defined in the targetResolver function above.
      //       👇 0      👇 1       👇 2
      const [loggedIn, loggedOut, addedTodo] = target.resolvedTargets;

      // The target current being handled
      //              👇
      switch (target.type) {
        case loggedIn: \\...
        case loggedOut: \\...
        case addedTodo: \\...
      }
    }
  )
}
```

## Listening to specific stages of a thunk

It is possible to target specific stages of a thunk (e.g. start, success, fail) when defining your listeners.

The action creators (i.e. the action instances used to dispatch an action with) have their "types" bound against them as properties.

For example, given the following store model;

```javascript
const storeModel = {
  todos: {
    items: [],
    addTodo: action(() => ...),
    saveTodo: thunk(() => ...)
  }
};

const store = createStore(storeModel);
```

We can access the type of each action/thunk like so;

```javascript
// actions:
console.log(store.getActions().todos.addTodo.type); // @action.todos.addTodo

// thunks:
console.log(store.getActions().todos.saveTodo.type); // @thunk.todos.saveTodo

// You can also access the type information for specific stages of a thunk:
console.log(store.getActions().todos.saveTodo.startType); // @thunk.todos.saveTodo(start)
console.log(store.getActions().todos.saveTodo.successType); // @thunk.todos.saveTodo(success)
console.log(store.getActions().todos.saveTodo.failType); // @thunk.todos.saveTodo(fail)
```

As you can see thunks have multiple types, each representing an action which will be fired each for each stage of an action. These actions have no effect on state and simply act as mechanism by which to respond to specific stages of a thunk. Each of the types can be described as follows:

- `startType`

  Represents an action that is fired when the thunk has started

- `successType`

  Represents an action that is fired when the thunk has succeeded (i.e. no errors)

- `failType`

   Represents an action that is fired when the thunk has failed

- `type`

  Represents an action that is fired when the thunk has completed (failed or succeeded).

Using this refactoring you can configure your listeners to target a specific action stage of a thunk, for example;

```javascript
onAddTodo: actionOn(
  actions => actions.saveTodo.successType, // 👈 only targeting thunks that succeed
  (state, target) => {
    state.auditLog.push(`Successfully saved a todo: ${target.payload}`);
  }
)
```
