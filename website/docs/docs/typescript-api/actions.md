# Actions

Allows you to get a type that represents the actions of a model.

```typescript
Actions<
  Model extends Object = {}
>
```

## Example

```typescript
import { Actions } from 'easy-peasy';
import { StoreModel } from './index';

type StoreActions = Actions<StoreModel>;
```

Typically this would only be useful when using the `useStoreActions` hook.

```typescript
import { useStoreActions, Actions } from 'easy-peasy';
import { StoreModel } from './store';

function MyComponent() {
  const addTodo = useStoreActions(
    (actions: Actions<StoreModel>) => actions.todos.addTodo
  );
}
```

That being said, we recommend you use the [createTypedHooks](/docs/typescript-api/create-typed-hooks.html) API instead.