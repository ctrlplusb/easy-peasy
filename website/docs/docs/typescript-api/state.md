# State

Allows you to get a type that represents the state of a model.

```typescript
State<
  Model extends object = {}
>
```

## Example

```typescript
import { State } from 'easy-peasy';
import { StoreModel } from './index';

type StoreState = State<StoreModel>;
```

Typically this would only be useful when using the `useStoreState` hook.

```typescript
import { useStoreState, State } from 'easy-peasy';
import { StoreModel } from './store';

function MyComponent() {
  const todos = useStoreState(
    (state: State<StoreModel>) => state.todos.items
  );
}
```

That being said, we recommend you use the [createTypedHooks](/docs/typescript-api/create-typed-hooks) API instead.