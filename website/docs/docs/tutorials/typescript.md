# TypeScript

Using TypeScript with Easy Peasy can dramatically improve our developer
experience, making it far easier to consume our store and perform refactoring of
it if required.

This tutorial will provide you with an overview on how to effectively combine
TypeScript and Easy Peasy. It assumes familiarity with the Easy Peasy API - if
you are a newcomer to Easy Peasy, then we would suggest that you firstly
orientate yourself via the [Quick Start](/docs/tutorials/quick-start.html)
tutorial.

We will only give a brief introduction to each of the primary TypeScript types
exported by Easy Peasy. We recommend that you visit the [API docs](/docs/api)
for each type for a fuller description of the generic arguments that each type
supports. We will be link to the appropriate docs within each section below.

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

If you wish to use TypeScript with Easy Peasy we recommend that you firstly
define a type that describes your store's model.

Easy Peasy ships with a number of types allowing you to express actions, thunks,
computed properties, etc.

### State

Defining your model state will be a very familiar to those experienced with
TypeScript.

```typescript
interface Todo {
  text: string;
  done: boolean;
}

interface TodoModel {
  items: Todo[];
}
```

### Actions

To define an action you need to import the associated type from Easy Peasy.

```typescript
import { Action } from 'easy-peasy';

interface TodoModel {
  items: Todo[];
  addTodo: Action<TodosModel, Todo>;
}
```

You need to provide two generic arguments to an `Action`.

1. **The model it is operating against**

   As an action will receive the local state as an argument we need to provide
   the model that it will be bound to.

   _Note:_ This must be the local model type it is operating against. Not the
   root model type.

2. **The payload** (_optional_)

   If your action is to receive a payload you can define the type for the
   payload.

If you wish to make your payload an optional value you can use a union.

```typescript
Action<TodosModel, Todo | undefined>
```

See the the [API Docs for this type](/docs/typescript-api/action.html) for more
information.

### Thunks

To define a thunk you need to import the associated type from Easy Peasy.

```typescript
import { Thunk } from 'easy-peasy';

interface TodosModel {
  items: Todo[];
  addTodo: Action<TodosModel, Todo>;
  saveTodo: Thunk<TodosModel, Todo>;
}
```

You need to provide two generic arguments to a `Thunk`.

1. **The model it is operating against**

   As an thunk will receive the local actions as an argument we need to provide
   the model that it will be bound to.

   _Note:_ This must be the local model type it is operating against. Not the
   root model type.

2. **The payload** (_optional_)

   If your thunk is to receive a payload you can define the type for the
   payload.

If you wish to make your payload an optional value you can use a union.

```typescript
Thunk<TodosModel, Todo | undefined>
```

See the the [API Docs for this type](/docs/typescript-api/thunk.html) for more
information.

### Computed Properties

To define a computed property import the associated type from Easy Peasy and
then declare the type for the derived state.

```typescript
import { Computed } from 'easy-peasy';

interface TodosModel {
  items: Todo[];
  completedItems: Computed<TodosModel, Todo[]>;
  addTodo: Action<TodosModel, Todo>;
  saveTodo: Thunk<TodosModel, Todo>;
}
```

You need to provide two generic arguments to a `Computed` property.

1. **The model it is operating against**

   As the computed property will receive the local state as an input we need to
   provide the model that it will be bound to.

   _Note:_ This must be the local model type it is operating against. Not the
   root model type.

2. **The result**

   Declare the type for the derived state that will be resolved.

If you wish to make the computed value optional you can use a union.

```typescript
Computed<TodosModel, Todo[] | undefined>
```

See the the [API Docs for this type](/docs/typescript-api/computed.html) for
more information.

## Create your store

Once you have your model definition you can provide it as a type argument to the
`createStore` function.

Given that you have the following `./todos.model.ts`:
```typescript
import { action, Action, computed, Computed, thunk, Thunk } from 'easy-peasy';

interface Todo {
  text: string;
  done: boolean;
}

export interface c {
  items: Todo[];
  completedItems: Computed<TodosModel, Todo[]>;
  addTodo: Action<TodosModel, Todo>;
  saveTodo: Thunk<TodosModel, Todo>;
}

const todosStore: TodosModel = {
  items: [],
  completedItems: computed((state) => state.items.filter((todo) => todo.done)),
  addTodo: action((state, payload) => {
      state.todos.push(payload);
  }),
  saveTodo: thunk(async (actions, payload) => {
      const result = await axios.post('/todos', payload);
      actions.addTodo(result.data);
  }),
};

export default todosStore;
```

Your `model.ts` might look like this:
```typescript
import { createStore } from 'easy-peasy';
import todosStore, { TodosModel } from './todos.model';

export interface StoreModel {
  todos: TodosModel;
}

const store = createStore<StoreModel>({
  todos: todosStore
});
```

You will have noticed that all the typing information would have been displayed
to you, with assertions that your store satisfies the `StoreModel` definition.

In this case, our `StoreModel` consists of a sub-store `todos`.

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

See the the
[API Docs for this type](/docs/typescript-api/create-typed-hooks.html) for more
information.

### Using the typed hooks

You can now import the typed hooks that you created, and use them as normal
within your components.

```typescript
import { useStoreState } from './my-store/hooks';

function Todos() {
  const todos = useStoreState((state) => state.todos.items);
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
We suggest that you review the API docs for the TypeScript types for a more
complete description of each type.
