# Creating your store

The heart of your Easy Peasy [store](/docs/api/store) is the model definition that you provide to it. Your model is an object based structure describing the state and behaviour ([actions](/docs/api/action) etc) of your [store](/docs/api/store). It can be as deep as you like and can even be split across multiple files, allowing you to import and compose them as you please.

For this tutorial we will be creating an application that consists of products and a basket. A user adds products to their basket.

## Model definition

We will start off by representing the state for our application, separating the models out logically.

Firstly, our products model.

```javascript
const productsModel {
  items: [
    { id: 1, name: 'Broccoli', price: 2.50 },
    { id: 2, name: 'Carrots', price: 4 },
  ]
};
```

Then our basket model.

```javascript
const basketModel {
  productIds: [2]
};
```

We will noe compose our models into a single [store](/docs/api/store) model.

```javascript
const storeModel {
  products: productsModel,
  basket: basketModel
}
```

You can organise your models you please. My personal preference is to split them out into separate files.


## Creating the store

Now that we have our model defined we can pass it to [createStore](/docs/api/create-store) in order to create our [store](/docs/api/store).

```typescript
import storeModel from './model';

const store = createStore(storeModel);
```

## Demo Application

You can view the progress of our demo application [here](#).
