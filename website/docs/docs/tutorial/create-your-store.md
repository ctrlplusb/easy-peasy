# Creating your store

The heart of your Easy Peasy [store](/docs/api/store) is the model definition that you provide to it. Your model is an object based structure describing the state and behaviour ([actions](/docs/api/action) etc) of your [store](/docs/api/store). It can be as deep as you like and can be split across multiple files, allowing you to import and compose them as you please.

Our [application's](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k) state is currently being imported from the `src/data.js` file. Let's create a model that represents the data contained within that file. After that we will be able to use our model to create the [store](/docs/api/store).

## The src/data.js file

Below are the contents of the data file currently being used by our application.

```javascript
export const products = [
  { id: 1, name: 'Broccoli', price: 2.5 },
  { id: 2, name: 'Carrots', price: 4 },
];

export const basket = [2];
```

We have a set of products, as well as a basket containing the ids of the products that have been added to it.

## Creating our models

We will split the data into two models; `productsModel` and `basketModel`, each of them being contained within their own file.

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

And now the basket model.

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

import { createStore } from 'easy-peasy';  // 👈 import
import storeModel from '../model';

const store = createStore(storeModel); // 👈 create our store

export default store;
```

> The returned [store](/docs/api/create-store) instance is actually a [redux](https://redux.js.org/) store. You could use this store with any library that expects a [redux](https://redux.js.org/) store - for example the [react-redux](https://github.com/reduxjs/react-redux) library. One use case for this is if you would like to slowly migrate an existing application from React Redux to Easy Peasy.

## Review

Great, we now have a [store](/docs/api/create-store) with our state representing the dummy data from the `src/data.js` file.

In the next section we will connect the [store](/docs/api/store) to our application.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-store-zgtwh).
