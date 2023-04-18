# EffectOn

## API

```typescript
type EffectOn<
  Model extends object = {},
  StoreModel extends object = {},
  Injections = any
>
```

- `Model`

  The model against which the [effectOn](/docs/api/effect-on.html) property is
  being defined. You need to provide this so that the state that will be
  provided to your [effectOn](/docs/api/effect-on.html) is correctly typed.

- `StoreModel`

  If you expect to target state from the entire store then you will need to
  provide your store's model interface so that the store state is correctly
  typed.

- `Injections`

  If your store was configured with injections, and you intend to use them
  within your [effectOn](/docs/api/effect-on.html), then you should provide the
  type of the injections here.

## Example

```typescript
import { EffectOn, effectOn } from 'easy-peasy';

interface TodosModel {
  todos: string[];
  onTodosChanged: EffectOn<TodosModel>;
}

const todosModel: TodosModel = {
  todos: [],
  onTodosChanged: effectOn(
    [(state) => state.todos],
    async (actions, change) => {
      const [todos] = change.current;
      await todosService.save(todos);
    },
  ),
};
```
