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

Like examples instead of docs?
[Then look no further!](https://github.com/ctrlplusb/easy-peasy/tree/master/examples)

- [Define your model](#define-your-model)
  - [State](#state)
  - [Actions](#actions)
  - [Thunks](#thunks)
  - [Computed Properties](#computed-properties)
- [Create your store](#create-your-store)
- [Typing the hooks](#typing-the-hooks)
  - [Using the typed hooks](#using-the-typed-hooks)
- [Using typed injections](#using-typed-injections)
  - [Using the typed injections](#typing-injections-on-our-thunk)
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
  todos: Todo[];
}
```

### Actions

To define an action you need to import the associated type from Easy Peasy.

```typescript
import { Action } from 'easy-peasy';

interface TodoModel {
  todos: Todo[];
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
Action<TodosModel, Todo | undefined>;
```

See the the [API Docs for this type](/docs/typescript-api/action.html) for more
information.

### Thunks

To define a thunk you need to import the associated type from Easy Peasy.

```typescript
import { Thunk } from 'easy-peasy';

interface TodosModel {
  todos: Todo[];
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
Thunk<TodosModel, Todo | undefined>;
```

See the the [API Docs for this type](/docs/typescript-api/thunk.html) for more
information.

### Computed Properties

To define a computed property import the associated type from Easy Peasy and
then declare the type for the derived state.

```typescript
import { Computed } from 'easy-peasy';

interface TodosModel {
  todos: Todo[];
  completedTodos: Computed<TodosModel, Todo[]>;
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
Computed<TodosModel, Todo[] | undefined>;
```

See the the [API Docs for this type](/docs/typescript-api/computed.html) for
more information.

## Create your store

Once you have your model definition you can provide it as a type argument to the
`createStore` function.

```typescript
import {
  createStore,
  action,
  Action,
  computed,
  Computed,
  thunk,
  Thunk,
} from 'easy-peasy';

interface Todo {
  text: string;
  done: boolean;
}

export interface TodosModel {
  todos: Todo[];
  completedTodos: Computed<TodosModel, Todo[]>;
  addTodo: Action<TodosModel, Todo>;
  saveTodo: Thunk<TodosModel, Todo>;
}

const store = createStore<TodosModel>({
  todos: [],
  completedTodos: computed((state) => state.todos.filter((todo) => todo.done)),
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  saveTodo: thunk(async (actions, payload) => {
    await axios.post('/todos', payload);
    actions.addTodo(payload);
  }),
});
```

You will have noticed that all the typing information would have been displayed
to you, with assertions that your store satisfies the `TodosModel` definition.

## Typing the hooks

In order to avoid having to constantly provide your `TodosModel` definition to
each use of the Easy Peasy hooks, we provide a utility API that allows you to
create versions of the hooks that will have the `TodosModel` type information
baked in.

```typescript
import { createTypedHooks } from 'easy-peasy';
import { TodosModel } from './model';

const typedHooks = createTypedHooks<TodosModel>();

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

## Using typed injections

Let's refactor our code, to use a `todoService` that encapsulates all server
interaction. We want to define a service like this and then reference this in
our `saveTodo`-thunk:

```ts
// src/services/todoService.ts

export const save = (todo: string): Promise<void> => {
  const result = await axios.post('/todos', payload);
  console.log('Todo saved!, results:' result);
}
```

### Defining injections and injecting them into store

Firstly, let's define the injections, their type, and update the code used to
create our [store](/docs/api/store.html).

```typescript
// src/store/index.ts

import * as todosService from '../services/todos-service';

const injections = {
  todosService,
};

export type Injections = typeof injections;

const store = createStore(model, {
  // 👇 provide injections to our store
  injections,
});
```

### Typing injections on our thunk

Then we will update the [thunk](/docs/api/thunk.html) definition on our model
interface.

```typescript
import { Injections } from '../store';
//          👆 import the injections type

export interface TodosModel {
  items: string[];
  addTodo: Action<TodosModel, string>;
  saveTodo: Thunk<TodosModel, string, Injections>; // 👈 provide the type
}
```

### Refactoring thunk implementation to use injections

We can then refactor our [thunk](/docs/api/thunk.html) implementation.

```typescript
const todosModel: TodosModel = {
  items: [],
  addTodo: action((state, payload) => {
    state.items.push(payload);
  }),
  saveTodo: thunk(async (actions, payload, { injections }) => {
    const { todosService } = injections; // 👈 destructure the injections
    await todosService.save(payload);
    actions.addTodo(payload);
  }),
};
```

Again you should have noted all the typing information being available.

<div class="screenshot">
  <img src="../../assets/typescript-tutorial/typed-injections-imp.png" />
  <span class="caption">Typing info available using injections</span>
</div>

## Demo Application

You can view the progress of our demo application
[here](https://codesandbox.io/s/easy-peasy-typescript-tutorial-typed-injections-forked-5gkoyz?file=/src/store/index.ts)

## Final Notes

This is by no means an exhaustive overview of the types shipped with Easy Peasy.
We suggest that you review the API docs for the TypeScript types for a more
complete description of each type.

Take a look through the
[examples](https://github.com/ctrlplusb/easy-peasy/tree/master/examples) for
more insight.
