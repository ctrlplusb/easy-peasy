# Adding typed listeners

In the previous section we extended our [thunk](/docs/api/thunk.html) implementation so that it would create an audit log entry every time a todo was saved. This isn't the best design as the todos model shouldn't have to know about the audit model.

An alternative, cleaner approach, would be for the audit model to respond to the `addTodo` action, logging accordingly. We can achieve this via an [actionOn](/docs/api/action-on.html) listener. Let's refactor our implementation to do this.

## Defining an action that will act as our listener

Firstly, we will add a new [actionOn](/docs/api/action-on.html) listener to the interface definition for our audit model.

```typescript
import { ActionOn } from 'easy-peasy'; // 👈 import the type
import { StoreModel } from './index';

interface AuditModel {
  log: string[];
  addLog: Action<AuditModel, string>;
  onTodoAdded: ActionOn<AuditModel, StoreModel>; // 👈 define a listener
}
```

Note that we have provided both the `AuditModel` and the `StoreModel` to our `ActionOn` definition, this is because we anticipate the implementation to target an action from another part of our model. If your `ActionOn` listener was going only going to target [actions](/docs/api/action.html)/[thunks](/docs/api/thunks.html) that are local to the listener you wouldn't need to provide the `StoreModel`.

## Implementing the actionOn listener

Now we will implement the [actionOn](/docs/api/action-on.html) listener, configuring to listen to the `addTodo` [action](/docs/api/action.html).

```typescript
import { actionOn } from 'easy-peasy'; // 👈 import the helper

const auditModel: AuditModel = {
  logs: [],
  addLog: action((state, payload) => {
    state.logs.push(payload)
  }),
  onTodoAdded: actionOn(
    // targetResolver resolving the addTodo action
    (actions, storeActions) => storeActions.todos.addTodo,
    // action handler:
    (state, target) => {
      state.logs.push(`Added todo: "${target.payload}"`);
    },
  )
};
```

Now every time the `addTodo` [action](/docs/api/action.html) is fired our `onTodoAdded` listener will fire and add an audit log.

> The `target.payload` type of our action handler will automatically be typed to match the resolved action(s). If you resolve a "string" name of an action then the payload will be typed as `any`.

## Refactor the `saveTodo` thunk

We can now remove the call to the audit model within our `saveTodo` thunk.

```diff
const todosModel: TodosModel = {
  items: [],
  addTodo: action((state, payload) => {
    state.items.push(payload);
  }),
-  saveTodo: thunk(async (actions, payload, { getStoreActions, injections }) => {
+  saveTodo: thunk(async (actions, payload, { injections }) => {
    const { todosService } = injections;
    await todosService.save(payload);
    actions.addTodo(payload);
-    getStoreActions().audit.addLog(`Added todo: ${payload}`);
  }),
};
```

## Review

We added an [actionOn](/docs/api/action-on.html) listener, but you could very similarly have defined a [thunkOn](/docs/api/thunk-on.html) listener.

You can view the progress of our demo application [here](https://codesandbox.io/s/easy-peasytypescript-tutorialtyped-listeners-0w1rv)