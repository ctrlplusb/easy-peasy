# Computed

Defines a [computed](/docs/api/computed.html) property against your model.

## API

```typescript
Computed<
  Model extends object = {},
  Result = any,
  StoreModel extends object = {}
>
```

- `Model`

  The model against which the [computed](/docs/api/computed.html) property is being defined. You need to provide this so that the state that will be provided to your [computed](/docs/api/computed.html) property is correctly typed.

- `Result`

  The type of the derived data that will be returned by your [computed](/docs/api/computed.html) property.

- `StoreModel`

  If you expect to using state resolvers within your [computed](/docs/api/computed.html) property implementation which use the entire store state then you will need to provide your store's model interface so that the store state is correctly typed.


## Example

```typescript
import { Computed, computed } from 'easy-peasy';

interface TodosModel {
  todos: string[];
  count: Computed<TodosModel, number>;
}

const todosModel: TodosModel = {
  todos: [],
  count: computed(state => state.todos.length)
}
```

## Example with state resolvers using store state

```typescript
import { Computed, computed } from 'easy-peasy';
import { StoreModel } from './index';

interface BasketModel {
  productIds: string[];
  products: Computed<BasketModel, Product[], StoreModel>;
}

const basketModel: BasketModel = {
  productIds: [],
  products: computed(
    [
      state => state.productIds, 
      (state, storeState) => storeState.products.items
    ],
    (productIds, products) => productIds.map(id => products[id])
  )
}
```