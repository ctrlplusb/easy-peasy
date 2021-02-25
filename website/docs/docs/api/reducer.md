# reducer

Declares a section of state to be calculated via a "standard" reducer function -
as is typical in Redux.

This API specifically exists to help with integrations against existing Redux
based libraries, and to help with gradual migration from legacy Redux code.

For example
[redux-first-history](https://github.com/salvoravida/redux-first-history),
requires you to attach a reducer that they provide to your store.

```javascript
reducer((state = 1, action) => {
  switch (action.type) {
    case 'INCREMENT':
      state + 1;
    default:
      return state;
  }
});
```

- [API](#api)
  - [Arguments](#arguments)
- [Example](#example)

## API

The `reducer` function is described below.

### Arguments

- reducer (Function, required)

  The reducer function. It receives the following arguments.

  - `state` (Object, required)

    The current value of the property that the reducer was attached to.

  - `action` (Object, required)

    The action object, typically with the following shape.

    - `type` (string, required)

      The name of the action.

    - `payload` (any)

      Any payload that was provided to the action.

## Example

```javascript
import {
  createStore,
  reducer,
  useStoreState,
  useStoreDispatch,
} from 'easy-peasy';

const store = createStore({
  counter: reducer((state = 1, action) => {
    switch (action.type) {
      case 'INCREMENT':
        state + 1;
      default:
        return state;
    }
  }),
});

function Counter() {
  const count = useStoreState((state) => state.counter);
  const dispatch = useStoreDispatch();
  return (
    <button onClick={() => dispatch({ type: 'INCREMENT' })}>{count}</button>
  );
}
```
