# store

The following APIs of the [store](/docs/api/store) instance have been deprecated.

## store.triggerListener

Allows you to trigger a `listen` registration of your model with the provided `action`.

### Arguments

 - `listener` (Listen, required)

    The listener instance to trigger.

 - `action` (Action | Thunk | string, required)

    The action to fire against the listener. Any registered handlers within the listener registration for the given action type will be fired.

 - `payload` (any)

    The payload to provide for the action.

### Returns

  A promise that resolves when all listener handlers have completed.

### Examples

Given the following store definition:

```javascript
const model = {
  session: {
    user: undefined,
    registerSession: action((state, payload) => {
      state.user = payload;
    }),
    logIn: thunk(async (actions, payload) => {
      const user = await loginService(payload);
      actions.registerSession(user);
    }),
  },
  audit: {
    logs: [],
	sessionHistory: [],
	logSessionHistory: action((state, payload) => {
      state.sessionHistory.push(payload);
	}),
    listeners: on => {
      on(model.session.registerSession, thunk((actions, payload) => {
        actions.logSessionHistory(payload.username);
      });
      on(model.session.logIn, action((state, payload) => {
        state.logs.push(`Authenticated ${payload.username} against server`);
      });
    }
  }
}

const store = createStore(model);
```

We can trigger the listeners defined on our "audit" model like so:

```javascript
store.triggerListener(
  models.audit.listeners, // The listeners to trigger
  model.session.logIn, // The action to trigger them with
  { username: 'bob' } // The payload for the action
);

// assert the changes
expect(store.getState().audit.logs).toEqual(['Authenticated bob against server']);
```

If the handler defined within your listeners is a `thunk` you should resolve the promise that is returned by the `triggerListener` call before asserting any changes:

```javascript
store.triggerListener(
  models.audit.listeners, // The listeners to trigger
  model.session.registerSession, // The action to trigger them with
  { username: 'bob' } // The payload for the action
).then(() => {
    // assert the changes
    expect(store.getState().audit.sessionHistory).toEqual(['bob']);
});
```

You can also use the `mockActions` configuration to assert the thunk handler in isolation:

```javascript
import { actionName } from 'easy-peasy';

const store = createStore(model, { mockActions: true });

store.triggerListener(
  models.audit.listeners, // The listeners to trigger
  model.session.registerSession, // The action to trigger them with
  { username: 'bob' } // The payload for the action
).then(() => {
    // assert the changes
    expect(store.getMockedActions()).toEqual([
        { type: actionName(models.audit.logSessionHistory), payload: 'bob' }
    ]);
});
```

## store.triggerListeners

Allows you to trigger all registered listeners across the store that are listening to the provided `action`.

### Arguments

 - `action` (Action | Thunk | string, required)

    The action to fire that will trigger listeners that are targeting it.

 - `payload` (any)

    The payload to provide.

### Returns

  A promise that resolves when all fired listeners have completed.

