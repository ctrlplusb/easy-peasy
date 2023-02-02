# createTransform

Creates a transformer, which can be applied to [`persist`](/docs/api/persist.html) configurations.

Transformers are use to apply operations to your data during prior it being persisted or hydrated.

One use case for a transformer is to handle data that can't be parsed to a JSON string. For example a `Map` or `Set`. To handle these data types you could utilise a transformer that converts the `Map`/`Set` to/from an `Array` or `Object`.

This helper has been directly copied from [`redux-persist`](https://github.com/rt2zz/redux-persist), with the intention of maximising our compatibility with the `redux-persist` ecosystem.

> [`redux-persist`](https://github.com/rt2zz/redux-persist) already has a robust set of [transformer packages](https://github.com/rt2zz/redux-persist#transforms) that have been built for it.

## API

The function accepts the following arguments:

  - `inbound` (data: any, key: string, fullState: any) => any; *optional*

    This function will be executed against data prior to it being persisted by the configured storage engine.

  - `outbound` (data: any, key: string, fullState: any) => any; *optional*

    This function will be executed against data prior after it is extracted from the configured storage engine.

  - `configuration` Object; *optional*

     Additional configuration for the transform. An object supporting the following properties.

     - `whitelist` Array&lt;string&gt;; *optional*

       The data keys that this transformer would apply to.

     - `blacklist` Array&lt;string&gt;; *optional*

       The data keys that this transformer would not apply to.

