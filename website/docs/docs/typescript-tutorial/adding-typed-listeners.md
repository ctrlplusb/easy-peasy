# Adding typed listeners

In the previous section we extended our [thunk](/docs/api/thunk) implementation so that it would create an audit log entry every time a todo was saved. This isn't the best design as the todos model shouldn't have to know about the audit model.

An alternative, cleaner approach, would be for the audit model to respond to the `addTodo` action, logging accordingly. We can achieve this via an [action](/docs/api/action) configured as a listener. Let's refactor our implementation to do this.

Firstly, we will add a new [action](/docs/api/action) to the interface definition for our audit model. This [action](/docs/api/action) will be used as the listener.

```typescript
interface AuditModel {
  log: string[];
  addLog: Action<AuditModel, string>;
  onTodoAdded: Action<AuditModel, string>; // 👈 new action which will be used
                                           //     as a listener
}
```

Now we will implement the [action](/docs/api/action), configuring to to listen to the `addTodo` [action](/docs/api/action).

```typescript
import todos from './todos-model';

const auditModel: AuditModel = {
  logs: [],
  addLog: action((state, payload) => {
    state.logs.push(payload)
  }),
  onTodoAdded: action(
    (state, payload) => {
      state.push(`Added todo: "${payload}"`);
    },
    { listenTo: todos.addTodo } // 👈 binding the action to listen to.
  )
};
```

Now every time the `addTodo` [action](/docs/api/action) is fired our `onTodoAdded` listening [action](/docs/api/action) will fire and add an audit log.  

Remember, our listening [action](/docs/api/action) will receive the same payload as the target [action](/docs/api/action). Therefore we need to ensure that the payload types will match across the listener and target. If they do not match a Typescript error will occur warning you of this fact.

***TODO: Screenshot of error for mistmatching payload***

We can now remove the call to the audit model within our `saveTodo` thunk.

```typescript
const todosModel: TodosModel = {
  items: [],
  addTodo: action((state, payload) => {
    state.items.push(payload);
  }),
  saveTodo: thunk(async (actions, payload, { injections }) => {
    const { todosService } = injections;
    await todosService.save(payload);
    actions.addTodo(payload);
    getStoreActions().audit.addLog(payload);  // 👈 remove this line
  })
};
```