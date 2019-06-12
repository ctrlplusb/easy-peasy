# Defining thunks to perform side effects

If you wish to perform side effects, such as data fetching, you can declare a [thunk](/docs/api/thunk) against your model.

```javascript
import { thunk } from 'easy-peasy';

const store = createStore({
  todos: {
    items: [],

    saveTodo: thunk(async (actions, payload) => {
      // call an api
      const savedTodo = await todoService.save(payload);

      // then dispatch an action with result
      actions.todoSaved(savedTodo);
    }),

    todoSaved: action((state, payload) => {
      state.items.push(payload)
    })
  }
});
```

As you can see [thunks](/docs/api/thunk) do not receive the state, rather they receive the [actions](/docs/api/action) that are local to it. You can dispatch the provided [actions](/docs/api/action) in order to perform updates to your state based on the results of your side effects.
