# Adding typed selectors

Let's imagine a new requirement for our application, where we would like to display the next 3 todos on our list.

We could naively implement it like so.

```typescript
import { useStoreState } from './my-store';

export default function NextTodos() {
  const todos = useStoreState(state => state.todos.items);
  const nextThree = todos.slice(0, 3);
  return (
    <ul>
      {nextThree.map(todo => <li>{todo}</li>)}
    </ul>
  );
}
```

This is a form of derived state, where we are deriving new state within our component. The deriving operation will occur any time that our component re-renders, or when a new todo is added to our store.

Although this example looks fairly harmless, there may be cases where you the deriving proces is an expensive operation. Alternatively you may have the need to display the next todos in many parts of your application, leading to duplication of the deriving logic.

For these cases we recommend that you define a [selector](/docs/api/selector) to represent the derived state.

Easy Peasy exports a `Selector` type allowing you to declare a [selector](/docs/api/selector) on your model interface. The full definition for this type is:

```typescript
Selector<
  Model = {},
  Result = any,
  ResolvedState = any[],
  RuntimeArgs = any[],
  StoreModel = {}
>
```

As you can see the type accepts 5 type parameters, all of which are optional. Similar to the `Thunk` type this may seem like an excessive amount of type parameters, however, in most cases you would only have to provide the first 3.

The type arguments can be described as follows.

- `Model`

  The model against which the [selector](/docs/api/selector) is being bound. This allows us to ensure the the `state` that is provided to the state resolvers of the [selector](/docs/api/selector) are correctly typed.

- `Result`

  This allows you to declare the type of the data that will be returned by the [selector](/docs/api/selector).

- `ResolvedState`

  Allows you to declare the type of the data that will be returned by your state resolvers.

- `RuntimeArgs`

  Allows you to declare the type of the runtime args that will be provided to your [selector](/docs/api/selector).

- `StoreModel`

  If your state resolvers will operate against global state you will need to provide your store's model interface so that the global state is typed correctly. 

Let's extends our todos model interface to include a [selector](/docs/api/selector).

```typescript
import { Selector } from 'easy-peasy';

export interface TodosModel {
  items: string[];
  addTodo: Action<TodosModel, string>; 
  saveTodo: Thunk<TodosModel, string>;
  nextTodos: Selector<TodosModel, string[], [ string[] ]>; // 👈 declaring our selector
}
```

Note how the 3rd type argument, the `ResolvedState`, is an [] of types. This is because we declare an array of state resolvers in our [selector](/docs/api/selector) implementations. We can see this in our implementation below.

```typescript
import { thunk } from 'easy-peasy';

const todosModel: TodosModel = {
  items: [],
  addTodo: action((state, payload) => {
    state.items.push(payload);
  }),
  saveTodo: thunk(async (actions, payload) => {
    await todosService.save(payload);
    actions.addTodo(payload);
  }),
  // 👇 declaring our selector
  nextTodos: selector(
    [state => state.items], // our state resolvers, resolving 1 piece of state
    (resolvedState) => {
      const [items] = resolvedState; // desctructure our array
      return items.slice(0, 3); // derive the new data
    }
  )
};
```

Again, as we defined the `Selector` on our model, Typescript would have been making sure we implemented our [selector](/docs/api/selector) per spec.

***TODO: Screenshot of typing information on selector implementation***

Now let's go back to our `NextTodos` component and refactor it to use our [selector](/docs/api/selector).

```typescript
import { useStoreState } from './my-store';

export default function NextTodos() {
  const todos = useStoreState(state => state.todos.nextTodos());
  return (
    <ul>
      {todos.map(todo => <li>{todo}</li>)}
    </ul>
  );
}
```