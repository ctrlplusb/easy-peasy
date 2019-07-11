# Hot Reloading

Easy Peasy supports hot reloading - i.e. being able to dynamically update your model at development time whilst maintaining the current state of your application. This can lead to a much improved developer experience.

In order to configure your application to allow hot reloading of your Easy Peasy store you will need to do the following:

```javascript
// src/store/index.js

import { createStore } from "easy-peasy";
import model from "./model";

const store = createStore(model);

// Wrapping dev only code like this normally gets stripped out by bundlers
// such as Webpack when creating a production build.
if (process.env.NODE_ENV === "development") {
  if (module.hot) {
    module.hot.accept("./model", () => {
      store.reconfigure(model);  // 👈 Here is the magic
    });
  }
}

export default store;
```

Note how you can call the [store's](/docs/api/store) `reconfigure` method in order to reconfigure the store with your updated model. The existing state will be maintained.

You can [view a demo repository configured for hot reloading here](https://github.com/ctrlplusb/easy-peasy-hot-reload).