# EffectOn

> ***Note:** this is an experimental API. We are pre-releasing it to allow for early feedback. The API is subject to breaking changes with any release of Easy Peasy. As such we have prefixed the API with "unstable_", much like React does with its experimental APIs. Once the API has stabilised the "unstable_" prefix will be removed and semver based releases will be respected.*

## API

```typescript
type Unstable_EffectOn<
  Model extends object = {},
  StoreModel extends object = {},
  Injections = any
>
```

- `Model`

  The model against which the [unstable_effectOn](/docs/api/effect-on.html) property is being defined. You need to provide this so that the state that will be provided to your [unstable_effectOn](/docs/api/effect-on.html) is correctly typed.

- `StoreModel`

  If you expect to target state from the entire store then you will need to provide your store's model interface so that the store state is correctly typed.

- `Injections`

  If your store was configured with injections, and you intend to use them within your [unstable_effectOn](/docs/api/effect-on.html), then you should provide the type of the injections here.

## Example

```typescript
import { Unstable_EffectOn, unstable_effectOn } from 'easy-peasy';

interface TodosModel {
  todos: string[];
  onTodosChanged: Unstable_EffectOn<TodosModel>;
}

const todosModel: TodosModel = {
  todos: [],
  onTodosChanged: unstable_effectOn(
    [state => state.todos],
    async (actions, change) => {
      const [todos] = change.current;
      await todosService.save(todos);
    }
  )
}
```