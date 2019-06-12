# Defining thunks to perform side effects

If you wish to perform side effects, such as data fetching, you can declare a [thunk](/docs/api/thunk) against your model.

```javascript
import { thunk } from 'easy-peasy';
//         👆 import the helper

const store = createStore({
  todos: {
    items: [],

    // Define our thunk
    //         👇
    saveTodo: thunk(async (actions, payload) => {
      // In this example we call a service to save the todo
      const savedTodo = await todoService.save(payload);

      // Then dispatch an action with the result to add it to our state
      actions.todoSaved(savedTodo);
    }),

    todoSaved: action((state, payload) => {
      state.items.push(payload)
    })
  }
});
```

As you can see [thunks](/docs/api/thunk) do not receive the state, rather they receive the [actions](/docs/api/action) that are local to it. You can dispatch the provided [actions](/docs/api/action) in order to perform updates to your state based on the results of your side effects.
