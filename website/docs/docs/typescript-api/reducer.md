# Reducer

Defines a [reducer](/docs/api/reducer.html) against your model.

## API

```typescript
Reducer<
  State = any, 
  Action extends ReduxAction = ReduxAction
>
```

- `State`

  The type for the state that will be managed by the [reducer](/docs/api/reducer.html).

- `Action`

  The type of the actions that may be received by the reducer.


## Example

```typescript
import { Reducer, reducer } from 'easy-peasy';

interface StoreModel {
  todos: Reducer<string[]>;
}

const storeModel: StoreModel = {
  todos: reducer((state = [], action) => {
    switch (action.type) {
      case 'ADD_TODO': return [...state, action.payload];
      default: return state;
    }
  })
}
```