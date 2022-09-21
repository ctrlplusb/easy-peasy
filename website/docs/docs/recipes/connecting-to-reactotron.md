# Connecting to Reactotron

[Reactotron](https://github.com/infinitered/reactotron) is a desktop app for inspecting your React JS and React Native projects.

It is possible to configure Easy Peasy so to be connected to your Reactotron instance.

Firstly, ensure you have a Reactotron configuration similar to.

```javascript
// reactotron.js

import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";

const reactron = Reactotron.configure()
  .useReactNative()
  .use(reactotronRedux())
  .connect();

export default reactron;
```

Then update the manner in which you create your Easy Peasy store.

```javascript
// create-store.js

import { createStore } from "easy-peasy";
import model from "./model";

let storeEnhancers = [];

if (__DEV__) {
  const reactotron = require("./reactotron").default;
  storeEnhancers = [...storeEnhancers, reactotron.createEnhancer()];
}

const store = createStore(model, {
  enhancers: [...storeEnhancers],
});

export default store;
```
