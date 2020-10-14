# TypeScript

Using TypeScript with Easy Peasy can dramatically improve our developer
experience, making it far easier to consume our store and perform refactoring of
it if required.

This tutorial will provide you with a detailed introduction on how to
effectively combine TypeScript and Easy Peasy. It assumes familiarity with the
Easy Peasy API - if you are a newcomer to Easy Peasy, then we would suggest that
you firstly orientate yourself via the
[Quick Start](/docs/tutorials/quick-start.html) tutorial.

- [Define your model](#define-your-model)
  - [State](#state)
  - [Actions](#actions)
  - [Thunks](#thunks)
  - [Computed Properties](#computed-properties)
- [Create your store](#create-your-store)
- [Typing the hooks](#typing-the-hooks)
  - [Using the typed hooks](#using-the-typed-hooks)
- [Final Notes](#final-notes)

## Define your model

The heart of utilizing TypeScript with Easy Peasy is by providing a type
definition to describe your model. This is where you typically want to begin
your TypeScript journey with Easy Peasy.

Easy Peasy ships with a number of types allowing you to express actions, thunks,
computed properties, etc.

### State

Defining your model state will be a very familiar experience to how may
currently be utilizing TypeScript.

```typescript
interface Todo {
  text: string;
  done: boolean;
}

interface StoreModel {
  todos: Todo[];
}
```

### Actions

To define an action you need to import the associated type from Easy Peasy.

```typescript
import { Action } from 'easy-peasy';

interface StoreModel {
  todos: Todo[];
  addTodo: Action<StoreModel, Todo>;
}
```

You need to provide two generic arguments to an `Action`.

1. **The model it is operating against**

   As an action will receive the local state as an argument we need to provide
   the model that it will be bound to.

2. **The payload** (_optional_)

   If your action is to receive a payload you can define the type for the
   payload.

### Thunks

To define a thunk you need to import the associated type from Easy Peasy.

```typescript
import { Thunk } from 'easy-peasy';

interface StoreModel {
  todos: Todo[];
  addTodo: Action<StoreModel, Todo>;
  saveTodo: Thunk<StoreModel, Todo>;
}
```

You need to provide two generic arguments to a `Thunk`.

1. **The model it is operating against**

   As an thunk will receive the local actions as an argument we need to provide
   the model that it will be bound to.

2. **The payload** (_optional_)

   If your thunk is to receive a payload you can define the type for the
   payload.

### Computed Properties

To define a computed property import the associated type from Easy Peasy and
then declare the type for the derived state.

```typescript
import { Computed } from 'easy-peasy';

interface StoreModel {
  todos: Todo[];
  completedTodos: Computed<StoreModel, Todo[]>;
  addTodo: Action<StoreModel, Todo>;
  saveTodo: Thunk<StoreModel, Todo>;
}
```

You need to provide two generic arguments to a `Computed` property.

1. **The model it is operating against**

   As the computed property will receive the local state as an input we need to
   provide the model that it will be bound to.

2. **The result**

   Declare the type for the derived state that will be resolved.

## Create your store

Once you have your model definition you can provide it as a type argument to the
`createStore` function.

```typescript
import { createStore, computed, action, thunk } from 'easy-peasy';
import { StoreModel } from './model';

const store = createStore<StoreModel>({
  todos: [],
  completedTodos: computed((state) => state.todos.filter((todo) => todo.done)),
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  saveTodo: thunk(async (actions, payload) => {
    const result = await axios.post('/todos', payload);
    actions.addTodo(result.data);
  }),
});
```

You will have noticed that all the typing information would have been displayed
to you, with assertions that your store satisfies the `StoreModel` definition.

## Typing the hooks

In order to avoid having to constantly provide your `StoreModel` definition to
each use of the Easy Peasy hooks, we provide a utility API that allows you to
create versions of the hooks that will have the `StoreModel` type information
baked in.

```typescript
import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from './model';

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
```

### Using the typed hooks

You can now import the typed hooks that you created, and use them as normal
within your components.

```typescript
import { useStoreState } from './my-store/hooks';

function Todos() {
  const todos = useStoreState((state) => state.todos);
  return (
    <ul>
      {todos.map((todo) => (
        <li>{todo.text}</li>
      ))}
    </ul>
  );
}
```

You will have noted a fully typed experience, with autocompletion and type
assertion ensuring that you are utilizing the store correctly.

## Final Notes

This is by no means an exhaustive overview of the types shipped with Easy Peasy.
We suggest that you review the API docs for the TypeScript types if you need
more complex incantations of each type.
