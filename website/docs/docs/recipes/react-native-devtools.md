# React Native Dev Tools

React Native, hybrid, desktop and server side Redux apps can use Redux Dev Tools using the [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) library.

To use this library, you will need to pass the DevTools compose helper as part of the [config object](#createstore) to `createStore`

```javascript
import { createStore } from 'easy-peasy';
import { composeWithDevTools } from 'remote-redux-devtools';
import model from './model';

const store = createStore(model, {
  compose: composeWithDevTools({ realtime: true, trace: true })
});

export default store;
```

In the example above you will see that we are extending our store, providing an override to the default `compose` function used for our Redux store enhancers. We are utilising the compose exported by the [remote-redux-devtools](https://github.com/zalmoxisus/remote-redux-devtools) library.
