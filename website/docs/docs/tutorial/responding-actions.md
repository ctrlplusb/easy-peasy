# Updating multiple state parts via a single action

There are cases where you may want to perform updates on one part of your 
model in response to an action being fired on another part of it.

For example, say you wanted to clear certain parts of your state when a user
logs out, or perhaps you would like an audit log to tracks when specific actions
are fired.

To support these use cases Easy Peasy allows you to declare an action as being
a "listener". Within the configuration for an action you simply provide
a target action you would like to listen to. Once this has been configured your
action will be executed every time the target action has executed successfully.

```javascript
const todosModel = {
  items: [],
  // 👇 this is the action we wish to listen to
  addTodo: action((state, payload) => {
    state.items.push(payload)
  })
};

const auditModel = {
  logs: [],
  // 👇 and this is the listening action
  onAddTodo: action(
    (state, payload) => {
      state.logs.push(`Added todo: ${payload.text}`);
    },
    { listenTo: todosModel.addTodo }
  )
};

const model = {
  todos: todosModel,
  audit: auditModel
};
```

In the example above note that the `onAddTodo` action has been provided a 
configuration, with the `addTodo` action being set as a target.

Any time the `addTodo` action completes successfully, the `onAddTodo` will be
fired, receiving the same payload as what `addTodo` received.

Being able to declare listeners allows you to maintain clearer separation of 
concerns and promotes a more reactive programming model.

Both actions and thunks support the ability to be configured as a listener.
