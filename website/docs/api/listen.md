# listen

Allows you to attach listeners that can respond to any action/thunk. This enables
parts of your model to act in response to actions being fired in another
part of your model.

For example you could may wish to have an audit log that populates based on
certain key actions being fired (logged in, product added to basket, etc).

```javascript
listen((on) => {
  on(userModel.loggedIn, action((state, payload) => {
    state.logs.push(`${payload.username} logged in`);
  }));
})
```

## Arguments

  - `on` (Function, required)

    Allows you to attach a listener to an action. You can attach as many
    listeners as required. It requires the following arguments.

    - `target` (action ref | thunk ref | string, required)

      The target action you wish to listen to. Either the direct reference to
      the action, or the string name of it.

    - `handler` (action | thunk, required)

      The handler to be executed after the target action has successfully
      completed. This can be an [`action`](#action) or a [`thunk`](#thunkaction).

      The payload for the handler will be the same payload that the target action received.


## Examples

### Listening to an action, firing an action

```javascript
import { action, listen } from 'easy-peasy'; // 👈 import the helper

const userModel = {
  user: null,
  loggedIn: action((state, user) => {
    state.user = user;
  }),
};

const notificationModel = {
  msg: '',
  listeners: listen((on) => {
    on(userModel.loggedIn, action((state) => {
      state.msg = 'User logged in'
    }));
  })
};
```

### Listening to string named action

In this example we will listen to a string named action. This can be especially
useful in cases where you have integrated with 3rd party Redux libraries.

```javascript
import { listen } from 'easy-peasy';

const notificationModel = {
  msg: '',
  listeners: listen((on) => {
    on('ROUTE_CHANGED', action((state, payload) => {
      state.msg = `Route was changed`;
    }));
  })
};
```
