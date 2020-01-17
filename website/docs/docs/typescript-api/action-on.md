# ActionOn

Defines an [actionOn](/docs/api/action-on.html) listener against your model.

## API

```typescript
ActionOn<
  Model extends object = {},
  StoreModel extends object = {}
>
```

- `Model`

  The model against which the [actionOn](/docs/api/action-on.html) is being defined. You need to provide this so that the state that will be provided to your [actionOn](/docs/api/action-on.html) is correctly typed.

- `StoreModel`

  If you plan on targeting an action from another part of your store state then you will need to provide your store model so that the provided store actions are correctly typed.


## Example

```typescript
import { ActionOn, actionOn } from 'easy-peasy';
import { StoreModel } from '../index';

interface AuditModel {
  logs: string[];
  onTodoAdded: ActionOn<AuditModel, StoreModel>;
}

const auditModel: AuditModel = {
  logs: [],
  onTodoAdded: actionOn(
    (actions, storeActions) => storeActions.todos.addTodo,
    (state, payload) => {
      state.logs.push(`Added todo: ${payload}`);
    }
  )
}
```