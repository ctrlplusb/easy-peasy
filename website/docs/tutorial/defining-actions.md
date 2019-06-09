# Defining actions to update state

In order to update your state you need to define an action against your model.

```javascript
import { action } from 'easy-peasy';

const store = createStore({
  todos: {
    items: [],
    addTodo: action((state, payload) => {
      state.items.push(payload)
    })
  }
});
```

The action will receive as its first parameter the state that is local to it. In
the example above our action would receive `{ items: [] }`
as the value for its `state` argument. It will also receive any `payload` that
may have been provided when the action was dispatched.

You will notice that we are mutating the state directly within the action.
Don't worry, we use the amazing [immer](https://github.com/immerjs/immer) library
to convert these mutative updates into an immutable update against your store.

## Alternative syntax

Some people prefer to not to use this "mutation-like" API. You can alternatively use traditional methods of returning new instances.

```javascript
addTodo: action((state, payload) => {
  return { ...state, items: [...state.items, payload] };
})
```

Personally I find the above harder to read and error prone, however, I appreciate that this is a purely subjective matter.