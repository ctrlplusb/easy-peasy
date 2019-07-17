# Thunk

Defines a [thunk](/docs/api/thunk) against your model

## API

```typescript
Thunk<
  Model extends object = {},
  Payload = void,
  Injections = any,
  StoreModel extends object = {},
  Result = any
>
```

- `Model`

  The model against which the [thunk](/docs/api/thunk) is being defined. You need to provide this so that the actions that will be provided to your [thunk](/docs/api/thunk) are correctly typed.

- `Payload`

  The type of the payload that the [thunk](/docs/api/thunk) will receive. You can omit this if you do not expect the [thunk](/docs/api/thunk) to receive any payload.

- `Injections`

  If your store was configured with injections, and you intend to use them within your [thunk](/docs/api/thunk), then you should provide the type of the injections here.

- `StoreModel`

  If you plan on using the `getStoreState` or `getStoreActions` APIs of a [thunk](/docs/api/thunk) then you will need to provide your store model so that the results are correctly typed.

- `Result`

  If your [thunk](/docs/api/thunk) returns a value then the type of the value should be defined here. The result is returned to the calling point of the dispatch. It should be encapsulated within a Promise. e.g. `Promise<number>`.


## Example

```typescript
import { Thunk, thunk } from 'easy-peasy';
import { Injections } from './index';

interface TodosModel {
  todos: string[];
  savedTodo: Action<TodosModel, string>;
  saveTodo: Thunk<TodosModel, string, Injections>;
}

const todosModel: TodosModel = {
  todos: [],
  savedTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  saveTodo: thunk(async (actions, payload, { injections }) => {
    await injections.todosService.save(payload);
    actions.savedTodo(payload);
  })
}
```