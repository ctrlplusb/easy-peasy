# Using computed properties

In the previous section of our [application](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s) we added the capability to execute side effects via [thunks](/docs/api/thunk).

In this section we are going to look at how we can take advantage of the [computed](/docs/api/computed) API in order to support derived data. This will help us clean up some of [useStoreState](/docs/api/use-store-state) instances.

## Introducing the computed API

The [computed](/docs/api/computed) API allows you to define a property on your model that is derived from the state of your model.

```javascript
import { computed } from 'easy-peasy'; // 👈 import the helper

const sessionModel = {
  user: { username: 'jane' },
  isLoggedIn: computed(state => state.user != null) // 👈 define a computed property
}
```

You can access [computed](/docs/api/computed) properties via the [useStoreState](/docs/api/use-store-state) hook. They act just like any other state.

Apart from helping you to avoid repeating state deriving logic across your application, they also have really nice performance characteristics. For instance, they are only computed on-demand (i.e. when actually mapped out by a [useStoreState](/docs/api/use-store-state) hook).

In addition to this they will only be recalculated if their input state changes. This means that you can return any data you like from a computed property (e.g. a new array/object instance) and they won't fall into the same performance pitfall that can be experienced when deriving state within a [useStoreState](/docs/api/use-store-state) hook.

It looks like [computed](/docs/api/computed) is the perfect candidate to help us clean up the derived state logic that is within our [application's](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s) components.

## Refactoring the application to use computed properties

## Review

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-computed-uohgr).