# Using typed injections

Let's refactor our [thunk](/docs/api/thunk) from earlier so that the `todosService` is injected via our [store](/docs/api/store).

Firstly, let's update the code used to create our [store](/docs/api/store).

```typescript
import todosServive from './services/todos';

const store = createStore(model, {
  injections: {  // 👈 provide injections to our store
    todosService
  }
});
```

Now, let's define an interface to represent our injections.

```typescript
import { TodosService } from './services/todos';
//          👆 the interface for our todosService

interface StoreInjections {
  todosService: TodosService;
}
```

Then we will update the [thunk](/docs/api/thunk) definition on our model interface.

```typescript
import { StoreInjections } from './my-store';
//          👆import the type representing our injections

export interface TodosModel {
  items: string[];
  addTodo: Action<TodosModel, string>; 
  saveTodo: Thunk<TodosModel, string, StoreInjections>; // 👈 provide the type
}
```

We can then refactor our [thunk](/docs/api/thunk) implementation.

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
  })
};
```

Again you should have noted all the typing information being available.

***TODO: Screenshot of typing information on injections***
