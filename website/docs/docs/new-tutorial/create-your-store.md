# Creating your store

The heart of your Easy Peasy [store](/docs/api/store) is the model definition that you provide to it. Your model is an object based structure describing the state and behaviour ([actions](/docs/api/action) etc) of your [store](/docs/api/store). It can be as deep as you like and can even be split across multiple files, allowing you to import and compose them as you please.

Currently [the application's](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k) state is static, referenced directly via the `src/data.js` file. This of course won't do, so let's convert this data into our model. We can then use the model to create our [store](/docs/api/store).

## Creating our models

We will split the data into two models; `productsModel` and `storeModel`, each of them being contained within their own file.

Firstly, the products model.

```javascript
// src/model/products-model.js

const productsModel = {
  items: [
    { id: 1, name: 'Broccoli', price: 2.50 },
    { id: 2, name: 'Carrots', price: 4 },
  ]
};

export default productsModel;
```

And then the basket model.

```javascript
// src/model/basket-model.js

const basketModel = {
  productIds: [2]
};

export default basketModel;
```

Finally, we will compose our models into a single [store](/docs/api/store) model.

```javascript
// src/model/index.js

import productsModel from './products-model';
import basketModel from './basket-model';

const storeModel = {
  products: productsModel,
  basket: basketModel
}

export default storeModel;
```

Now that we have our [store](/docs/api/store) model we can go ahead and create our [store](/docs/api/store).

## Creating the store

We can create a [store](/docs/api/store) via the [createStore](/docs/api/create-store) API, providing it our model.

```typescript
// src/store/index.js

import { createStore } from 'easy-peasy';  // 👈 import from easy-peasy
import storeModel from '../model';

const store = createStore(storeModel); // 👈 create our store

export default store;
```

> The returned [store](/docs/api/create-store) instance is actually a [redux](https://redux.js.org/) store. You could use this store with any library that expects a [redux](https://redux.js.org/) store - for example the [react-redux](https://github.com/reduxjs/react-redux) library. However, if you are using Easy Peasy it is unlikely that you would have to do this, unless you are looking to slowly migrate an existing React Redux based application to Easy Peasy.

## Review

Great, we now have a [store](/docs/api/create-store), with its state representing the dummy data from the `src/data.js` file.

In our next section we will connect the [store](/docs/api/store) to our application.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-store-zgtwh).
