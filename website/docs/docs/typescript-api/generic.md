# Generic

Defines a "generic" value against your model.

## Background

Previously if you defined a model containing generic state, like below, TypeScript would break within your actions.

```typescript
interface StoreModel<K> {
  data: K;
  updateData: Action<StoreModel<K>, K>;
}

const numberStoreModel: StoreModel<number> = {
  data: 1337,
  updateData: action((state, payload) => {
    // A TypeScript would be thrown at this point
    //     👇
    state.data = payload;
  })
}
```

Unfortunately we were unable to directly resolve the case of generic state due to current limitations with the TypeScript type system. We created a [StackOverflow question](https://stackoverflow.com/questions/58738700/issue-with-generic-properties-when-type-mapping) which details the problem.

In a gist; the issue is that Easy Peasy's underlying `State` and `Action` types map over the user provider model types in order to filter down to types that represent state and actions respectively. However, when defining a generic state, TypeScript assumes that the generic state intersects with types that are trying to be filtered out of each case. Therefore the filtering ends up always removing your generic state.

To resolve the case of generic state we have introduced a new API helper. Any time you wish to have a generic state within your model, simply wrap it with the [`Generic`](/docs/typescript-api/generic.html) type, and then assigned the associated value within the model instance using the [`generic`](/docs/api/generic.html) helper.

## Example

The helpers are best described with a commented example.

```typescript
import { Generic, generic } from 'easy-peasy';

interface StoreModel<K> {
  data: Generic<K>;  // 👈 define a generic state
  updateData: Action<StoreModel<K>, K>;
}

const numberStoreModel: StoreModel<number> = {
  data: generic(1337),  // 👈 assign the initial value using the helper
  updateData: action((state, payload) => {
    // Note that you don't need to wrap the payload with the
    // helper          👇
    state.data = payload;
  })
}

function MyComponent() {
  const data = useStoreState(state => state.data);
  const updateData = useStoreActions(actions => actions.updateData);

  console.log(data)
  // 1337

  console.log(typeof numberStoreModel.getState().data)
  // number

  updateData(7331); // 👈 no need to wrap payload with the helper
}
```

We understand that this is slightly more verbose / confusing, but it's the smallest impact solution we could come up with for now. Hopefully in future iterations of TypeScript we can deprecate these helpers.
