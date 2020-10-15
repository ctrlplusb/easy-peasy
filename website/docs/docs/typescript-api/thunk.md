# Thunk

Declares a [thunk](/docs/api/thunk.html) against your model type definition.

## API

```typescript
Thunk<
  Model extends object = {},
  Payload = undefined,
  Injections = any,
  StoreModel extends object = {},
  Result = any
>
```

- `Model`

  The model against which the [thunk](/docs/api/thunk.html) is being defined.
  You need to provide this so that the actions that will be provided to your
  [thunk](/docs/api/thunk.html) are correctly typed.

- `Payload`

  The type of the payload that the [thunk](/docs/api/thunk.html) will receive.
  You can set this to `undefined` if you do not expect the
  [thunk](/docs/api/thunk.html) to receive any payload.

- `Injections`

  If your store was configured with injections, and you intend to use them
  within your [thunk](/docs/api/thunk.html), then you should provide the type of
  the injections here.

- `StoreModel`

  If you plan on using the `getStoreState` or `getStoreActions` APIs of a
  [thunk](/docs/api/thunk.html) then you will need to provide your store model
  so that the results are correctly typed.

- `Result`

  If your [thunk](/docs/api/thunk.html) returns a value then the type of the
  value should be defined here. The result is returned to the calling point of
  the dispatch.

## Example

```typescript
import { Thunk, thunk } from 'easy-peasy';
import { Injections } from './my-store.types.ts';

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
  }),
};
```

## Declaring a payload as being optional

If you would like to make a payload optional you can use a union with
`undefined`.

```typescript
import { Thunk } from 'easy-peasy';

interface MyModel {
  doSomething: Thunk<MyModel, string | undefined>;
}
```

You can now call the thunk in either of the two ways:

```typescript
const doSomething = useStoreActions((actions) => actions.doSomething);

doSomething('woot!');
doSomething();
```
