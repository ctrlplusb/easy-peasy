# model

Allows you to define a model, which encapsulates state and actions.

```javascript
const storeModel = model({
  todos: ['Learn Easy Peasy'],
});
```

## Arguments

  - modelDefinition (object, *required*)

    The definition of your model.

  - `config` (object, *optional*)

    Allows you to provide extra configuration for the model. The configuration object supports the following properties:

    - `persist` (boolean | object, *optional*)

      Toggle persistence of your model. See the [persist](/docs/api/persist.html) docs for more information.

## Limitations

TODO: Nested model limitations