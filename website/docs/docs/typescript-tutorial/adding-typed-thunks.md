# Adding typed thunks

In order to declare a [thunk](/docs/api/thunk) Easy Peasy exports a `Thunk` type. The full typing definition for the `Thunk` type is:

```typescript
type Thunk<
  Model extends Object = {},
  Payload = void,
  Injections = any,
  StoreModel extends Object = {},
  Result = any
>
```

As you can see it accepts 5 type parameters. That may seem like a lot, but in most implementations you will likely only need to provide 2 of them. I've tried to order them so that they most frequently used type parameters are defined first. The type parameters can be described as follows.

- `Model`

  The model against which the [thunk](/docs/api/thunk) is being bound. This allows us to ensure the the `actions` that are exposed to our [thunk](/docs/api/thunk) are correctly typed.

- `Payload`

  If you expect the [thunk](/docs/api/thunk) to receive a payload then you should provide the type for the payload. If your [thunk](/docs/api/thunk) will not receive any payload you can omit this type parameter or set it to `void`.

- `Injections`

  When [creating your store](/docs/api/create-store) your store allows the specification of `injections` via the [store configuration](/docs/api/store-config). One use case of the `injections` is to provide a mechanism by which to dependency injected services used to make HTTP calls into your [thunks](/docs/api/thunk). These `injections` are then exposed via the 3rd argument to your [thunks](/docs/api/thunk).

  Should you be using injections then providing the typing information via this type parameter will ensure that your [thunks](/docs/api/thunk) are using correctly typed versions of them.

- `StoreModel`

  The 3rd argument to your [thunks](/docs/api/thunk) allows you to get the entire store state (via `getStoreState`), and the entire store actions (via `getStoreActions`). For these to be correctly typed we need to ensure that we provide our store's interface here. You may be concerned with cyclical dependency imports but fear not - Typescript is totally fine with this.

- `Result`

  If you return data from your [thunk](/docs/api/thunk), then you should provide the expected type here.

  FYI - thunks alway return a `Promise`. By default it would just be a type of `Promise<void>`. This allows you to define `Promise<Result>`.

Let's define a thunk that will allow us to save a todo by posting to an HTTP endpoint.

```typescript
TODO
```