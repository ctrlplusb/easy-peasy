# ThunkOn

Defines a [thunk-on](/docs/api/thunk-on) listener against your model

## API

```typescript
ThunkOn<
  Model extends object = {},
  Injections = any,
  StoreModel extends object = {}
>
```

- `Model`

  The model against which the [thunk-on](/docs/api/thunk-on) is being defined. You need to provide this so that the actions that will be provided to your [thunk-on](/docs/api/thunk-on) are correctly typed.

- `Injections`

  If your store was configured with injections, and you intend to use them within your [thunk-on](/docs/api/thunk-on), then you should provide the type of the injections here.

- `StoreModel`

  If you plan on targeting an action from another part of your store state then you will need to provide your store model so that the provided store actions are correctly typed.
  
  Additionally, if you plan on using the `getStoreState` or `getStoreActions` APIs of a [thunk-on](/docs/api/thunk-on) then you will also need this so that their results are correctly typed.


## Example

```typescript
import { ThunkOn, thunkOn, Action, action } from 'easy-peasy';
import { StoreModel, Injections } from '../index';

interface AuditModel {
  logs: string[];
  addLog: Action<AuditModel, string>;
  onTodoAdded: ThunkOn<AuditModel, Injections, StoreModel>;
}

const auditModel: AuditModel = {
  logs: [],
  addLog: action((state, payload) => {
    state.logs.push(payload);
  }),
  onTodoAdded: thunkOn(
    (actions, storeActions) => storeActions.todos.addTodo,
    async (actions, payload, { injections }) => {
      await injections.auditService.add(`Added todo: ${payload}`);
      actions.addLog(`Added todo: ${payload}`);
    }
  )
}
```