# Action

Defines an [action](/docs/api/action.html) against your model

## API

```typescript
Action<
  Model extends object = {}, 
  Payload = void
>
```

- `Model`

  The model against which the action is being defined. You need to provide this so that the state that will be provided to your [action](/docs/api/action.html) is correctly typed.

- `Payload`

  The type of the payload that the [action](/docs/api/action.html) will receive. You can omit this if you do not expect the [action](/docs/api/action.html) to receive any payload.


## Example

```typescript
import { Action, action } from 'easy-peasy';

interface TodosModel {
  todos: string[];
  addTodo: Action<TodosModel, string>;
}

const todosModel: TodosModel = {
  todos: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  })
}
```