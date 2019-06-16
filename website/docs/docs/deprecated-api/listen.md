# listen

Allows you to attach listeners to any action or thunk.

This enables parts of your model to respond to actions being fired in other parts of your model. For example you could have a "notifications" model that populates based on certain actions being fired (logged in, product added to basket, etc).

It also supports attach listeners to a "string" named action. This allows with interop with 3rd party libraries, or aids in migration.

Note: If any action being listened to does not complete successfully (i.e. throws an exception), then no listeners will be fired.

```javascript
listen((on) => {
  on(userModel.loggedIn, action((state, payload) => {
    state.logs.push(`${payload.username} logged in`);
  }));
})
```

## Arguments

  - `on` (Function, required)

    Allows you to attach a listener to an action. It expects the following arguments:

    - `target` (action | thunk | string, required)

      The target action you wish to listen to - you provide the direct reference to the action, or the string name of it.

    - `handler` (Function, required)

      The handler thunk to be executed after the target action is fired successfully. It can be an [`action`](#action) or a [`thunk`](#thunkaction).

      The payload for the handler will be the same payload that the target action received


## Example

```javascript
import { action, listen } from 'easy-peasy'; // 👈 import the helper

const userModel = {
  user: null,
  loggedIn: action((state, user) => {
    state.user = user;
  }),
  logOut: action((state) => {
    state.user = null;
  })
};

const notificationModel = {
  msg: '',

  // 👇 you can label your listeners as you like, e.g. "userListeners"
  listeners: listen((on) => {
    // Thunk handler
    on(userModel.loggedIn, thunk(async (actions, payload, helpers) => {
      const msg = `${payload.username} logged in`
      await auditService.log(msg)
    }));

    // Action handler
    on(userModel.logOut, action((state) => {
      state.msg = 'User logged out'
    });
  })
};

const model = {
  user: userModel,
  notification: notificationModel
};
```

## Example listening to string named action

```javascript
import { listen } from 'easy-peasy';

const model = {
  msg: '',
  set: (state, payload) => { state.msg = payload; },

  listeners: listen((on) => {
    //      👇 passing in action name
    on('ROUTE_CHANGED', action(actions, payload) => {
      //                            👆
      // We won't know the type of payload, so it will be "any".
      // You will have to annotate it manually if you are using
      // Typescript and care about the payload type.
      actions.set(`Route was changed`);
    }));
  })
};
```