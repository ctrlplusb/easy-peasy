# Adding typed actions

In order to declare an action Easy Peasy exports an `Action` type. The full typing definition for the `Action` type is:

```typescript
Action<Model extends Object = {}, Payload = void>
```

As you can see it accepts 2 type parameters. They can be described as follows.

 - `Model`

   The model against which the action is being bound. This allows us to ensure the the `state` that is exposed to our action is correctly typed.

- `Payload`

  If you expect the action to receive a payload then you should provide the type for the payload. If your action will not receive any payload you can omit this type parameter.

Let's define an action that will allow us to add another todo.

```typescript
import { Action } from 'easy-peasy'; // 👈 import the type

export interface TodosModel {
  items: string[];
  addTodo: Action<TodosModel, string>; // 👈 declaring our action
}
```

As you can see our `Action` is operating against the `TodosModel` and it expects a payload of `string`.

We can now implement this action against our model.

```typescript
import { action } from 'easy-peasy';

const todos: TodosModel = {
  items: [],
  addTodo: action((state, payload) => {
    state.items.push(payload);
  });
};
```

You will have noted that Typescript was providing us with the typing information and assertions whilst we implemented our action.

***TODO: Screenshot of typing information on action implementation***

We can now consume the action within our component, making sure we use the typed version of `useStoreActions` that we exported from our store.

```typescript
import { useStoreActions } from './my-store'; // 👈 import typed hook

function AddTodo() {
  //                                  map the addTodo action 👇
  const addTodo = useStoreActions(actions => actions.todos.addTodo);

  // The below are the standard React hooks we are using to manage the form
  // state and the button onClick callback
  const [text, setText] = useState('');
  const onButtonClick = useCallback(() => {
    addTodo(text); // 👈 dispatch our action with the text describing the todo
    setText('');
  }, [addTodo, setText, text]);

  return (
    <>
      <input text={text} onChange={e => setText(e.target.value)} type="text />
      <button onClick={onButtonClick}>Add Todo</button>
    </>
  );
}
```

***TODO: Screenshot of typing information on action dispatch***