# Using `keyof T` within a generic TypeScript model

When defining generic model helpers via TypeScript you will be unable to put a restriction within your generic model based on the `keyof` the incoming generic model argument. This is illustrated below.

```typescript
import { computed, Computed, action, Action, thunk, Thunk } from "easy-peasy";

export interface DataModel<Item extends object> {
  items: Array<Item>;
  count: Computed<DataModel<Item>, number>;
  // This is not supported. It currently breaks the Easy Peasy typings,
  // resulting in the `dataModel` helper below not presenting the correct type
  // information to you.
  //        👇
  sortBy: keyof Item | "none";
}

export const dataModel = <Item extends object>(items: Item[]): DataModel<Item> => ({
  items: items,
  // This typing information would be invalid
  //                               👇
  count: computed(state => state.items.length),
  sortBy: "none"
});
```