# Adding typed thunks

Easy Peasy exports a `Thunk` type, allowing you to declare a [thunk](/docs/api/thunk) against your model interface. The full typing definition for the `Thunk` type is:

```typescript
type Thunk<
  Model extends Object = {},
  Payload = void,
  Injections = any,
  StoreModel extends Object = {},
  Result = any
>
```

As you can see it accepts 5 type parameters, all of them optional. This may seem like a lot of type parameters, but in most cases you will likely only need to provide 2 of them. We have tried to order the type parameters from the most to the least frequently used, based on our experience with [thunks](/docs/api/thunk). 

The type parameters can be described as follows.

- `Model`

  The model against which the [thunk](/docs/api/thunk) is being bound. This allows us to ensure the the `actions` argument that is provided to our [thunks](/docs/api/thunk) are correctly typed.

- `Payload`

  If you expect the [thunk](/docs/api/thunk) to receive a payload then you should provide the type for the payload. If your [thunk](/docs/api/thunk) will not receive any payload you can omit this type parameter or set it to `void`.

- `Injections`

  When [creating your store](/docs/api/create-store) your store allows the specification of `injections` via the [store configuration](/docs/api/store-config). One use case of the `injections` is to provide a mechanism by which to dependency injected services used to make HTTP calls into your [thunks](/docs/api/thunk). These `injections` are then exposed via the 3rd argument to your [thunks](/docs/api/thunk).

  Should you be using injections then providing the typing information via this type parameter will ensure that your [thunks](/docs/api/thunk) are using correctly typed versions of them.

- `StoreModel`

  The 3rd argument to your [thunks](/docs/api/thunk) allows you to get the entire store state (via `getStoreState`), and the entire store actions (via `getStoreActions`). For these to be correctly typed we need to ensure that we provide our store's interface here. You may be concerned with cyclical dependency imports but fear not - Typescript is totally fine with this.

- `Result`

  If you return data from your [thunk](/docs/api/thunk), then you should provide the expected type here.

  FYI - thunks alway return a `Promise`. By default it would just be a type of `Promise<void>`. This allows you to define `Promise<Result>`.

Let's define a thunk that will allow us to save a todo by posting to an HTTP endpoint.

```typescript
import { Thunk } from 'easy-peasy';

export interface TodosModel {
  items: string[];
  addTodo: Action<TodosModel, string>; 
  saveTodo: Thunk<TodosModel, string>; // 👈 declaring our thunk
}
```

As you can see our `Thunk` is operating against the `TodosModel` and it expects a payload of `string`.

We can now implement this action against our model.

```typescript
import { thunk } from 'easy-peasy';

const todosModel: TodosModel = {
  items: [],
  addTodo: action((state, payload) => {
    state.items.push(payload);
  }),
  saveTodo: thunk(async (actions, payload) => {
    await todosService.save(payload); // imagine calling an HTTP service
    actions.addTodo(payload);
  })
};
```

You will have noted that Typescript was providing us with the typing information and assertions whilst we implemented our [thunk](/docs/api/thunk).

***TODO: Screenshot of typing information on thunk implementation***

We can now consume the [thunk](/docs/api/thunk) within our component, making sure we use the typed version of `useStoreActions` that we exported from our store. We will refactor our component from earlier.

```typescript
import { useStoreActions } from './my-store'; // 👈 import typed hook

function AddTodo() {
  //                                  map the saveTodo thunk 👇
  const saveTodo = useStoreActions(actions => actions.todos.saveTodo);

  const [text, setText] = useState('');
  const onButtonClick = useCallback(() => {
    saveTodo(text) // 👈 dispatch our thunk with the text describing the todo
      .then(() => setText('')); // then chain off the promise returned by the thunk
  }, [addTodo, setText, text]);

  return (
    <>
      <input text={text} onChange={e => setText(e.target.value)} type="text />
      <button onClick={onButtonClick}>Add Todo</button>
    </>
  );
}
```

***TODO: Screenshot of typing information on thunk dispatch***
