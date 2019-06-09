# Responding to actions

There are cases where you may want to perform updates or side effects on one
part of your model, when an action is fired on another part of it.

For example, say you wanted to clear certain parts of your state when a user
logs out, or perhaps you would like an audit log to tracks specific actions.

The `listen` helper allows you to achieve this.

```javascript
import { listen } from 'easy-peasy';

const todosModel = {
  items: [],
  // 👇 this is the action we wish to listen to
  addTodo: action((state, payload) => {
    state.items.push(payload)
  })
};

const auditModel = {
  logs: [],
  listeners: listen((on) => {
    on(
      // listen to:
      todosModel.addTodo,
      // handler:
      action((state, payload) => {
        state.logs.push(`Added a new todo: ${payload}`);
      })
    );
  })
};

const model = {
  todos: todosModel,
  audit: auditModel
};
```

This is a more advanced feature, however, using this method allows a clearer separation of concerns and promotes a more reactive programming model.

You can listen to any action type (`action`/`thunk`), and can execute any action type in response. Please read the [docs](#listenon) for more information.