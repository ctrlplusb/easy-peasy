# listenTo

This is the documentation for the `listenTo` configuration property that is available on both [actions](/docs/api/action) and [thunks](/docs/api/thunk).

Setting this allows your [action](/docs/api/action) or [thunk](/docs/api/thunk) to act as a *listener*, automatically firing in response to the *target* actions that are resolved by your `listenTo` callback function. 

```javascript
onTodoAdded: action(
  (state, payload) => {
    state.logs.push(`Added todo: ${payload.text}`);
  },
  { listenTo: (actions, storeActions) => storeActions.todos.addTodo }
)
```

Any time any of the resolved *target(s)* are fired your *listener* [action](/docs/api/action) will be fired.

The *listener* will receive the same payload as was supplied to the *target(s)*.

This helps to promote a reactive model and allows for separation of concerns.

## Arguments

- `actions` (Object)

  The actions & thunks that are local to the action you are defining.

- `storeActions` (Object)

  All of the actions & thunks of your store.

## Return Types

Your function should then resolve a target [action](/docs/api/action), [thunk](/docs/api/thunk) or a string name of an action. The string form allows interop with other libraries (e.g. a 'ROUTE_CHANGE' action).

You can additionally resolve an array of targets, allowing you to respond to multiple targets.
  

## Listening to specific stages of a thunk 


## Listening to multiple actions

The b

  ```javascript
  const auditModel = {
    logs: [],
    onTodoAdded: action(
      (state, payload) => {
        state.logs.push(`Added todo: ${payload.text}`);
      },
      { listenTo: (actions, storeActions) => storeActions.todos.addTodo }
    )
  };

  store.getActions().todos.addTodo({ text: 'Learn Easy Peasy' });
  ```

## Listener actions

It is possible to define an [action](/docs/api/action) as being a *listener* via the `listenTo` configuration property. A *listener* [action](/docs/api/action) will be fired every time that the *target* [action](/docs/api/action)/[thunk](/docs/api/thunk) successfully completes. The *listener* will receive the same payload that was provided to the *target*.

An example use case for this would be the need to clear some state when a user logs out of your application, or if you would like to create an audit trail for when certain [actions](/docs/api/action)/[thunks](/docs/api/thunk) are fired.

```javascript
const todosModel = {
  items: [],
  //  👇 the target action
  addTodo: action((state, payload) => {
    state.items.push(payload);
  })
};

const auditModel = {
  logs: [],
  // 👇 the listener
  onAddTodo: action(
    (state, payload) => {
      state.logs.push(`Added todo: ${payload.text}`);
    },
    { listenTo: todosModel.addTodo } // 👈 declare the target to listen to
  )
};
```

In the example above note that the `onAddTodo` [action](/docs/api/action) has been provided a configuration, with the `addTodo` [action](/docs/api/action) being set as a target.

Any time the `addTodo` [action](/docs/api/action) completes successfully, the `onAddTodo` will be fired, receiving the same payload as what `addTodo` received.

## Listening to multiple actions

It is possible for a *listening* action to listen to multiple *targets*. Simply provide an array of *targets* against the `listenTo` configuration.

```javascript
const fooModel = {
  items: [],
  //  👇 the first target action
  firstAction: action((state, payload) => {
    state.items.push(payload);
  }),
  // 👇 the second target action
  secondAction action((state, payload) => {
    state.items.push(payload);
  }),
};

const auditModel = {
  logs: [],
  onAddTodo: action(
    (state, payload) => {
      state.logs.push(payload);
    },
    {
      // 👇 declare the targets within an array
      listenTo: [
        fooModel.firstAction,
        fooModel.secondAction
      ]
    }
  )
};
```

## Debugging listeners

Listeners are visible within the [Redux Dev Tools](https://github.com/zalmoxisus/redux-devtools-extension) extension. This makes it very easy to validate they are executing as expected, and to see the effect that they had on state.

Below is an example of an [action](/docs/api/action) *listener* being fired in response to an action.

<img src="../../assets/devtools-listenaction.png" />

## Listener thunk

It is possible to define a [thunk](/docs/api/thunk) as being a *listener* via the `listenTo` configuration property. A *listener* [thunk](/docs/api/thunk) will be fired every time that the *target* [action](/docs/api/action)/[thunk](/docs/api/thunk) successfully completes. The *listener* will receive the same payload that was provided to the *target*.

An example use case for this would be the need to clear some state when a user logs out of your application, or if you would like to create an audit trail for when certain [actions](/docs/api/action)/[thunks](/docs/api/thunk) are fired.

```javascript
const todosModel = {
  items: [],
  //  👇 the target action
  addTodo: action((state, payload) => {
    state.items.push(payload);
  })
};

const auditModel = {
  logs: [],
  // 👇 our listener thunk
  onAddTodo: thunk(
    async (actions, payload) => {
      await auditService.post(`Added todo: ${payload.text}`);
    },
    { listenTo: todosModel.addTodo } // 👈 declare the target to listen to
  )
};
```

In the example above note that the `onAddTodo` [thunk](/docs/api/thunk) has been provided a configuration, with the `addTodo` [action](/docs/api/action) being set as a target.

Any time the `addTodo` [action](/docs/api/action) completes successfully, the `onAddTodo` will be fired, receiving the same payload as what `addTodo` received.

## Debugging listeners

Listeners are visible within the [Redux Dev Tools](https://github.com/zalmoxisus/redux-devtools-extension) extension. This makes it very easy to validate they are executing as expected, and to see the effect that they had on state.

Below is an example of a [thunk](/docs/api/thunk) *listener* firing in response to another action.

<img src="../../assets/devtools-listenthunk.png" />