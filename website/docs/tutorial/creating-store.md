# Creating the store

Firstly, define your model. This represents the structure of your state along with its default values. Your model can be as deep and complex as you like. Feel free to split your model across many files, importing and composing them as you like.

```javascript
const model = {
  todos: {
    items: [],
  }
};
```

Then provide your model to `createStore`.

```javascript
import { createStore } from 'easy-peasy';

const store = createStore(model);
```

You will now have a [store](#store). 👍

> The created store is actually a Redux store - all the standard Redux store
> APIs are available. You can additionally pass the store into any 3rd party
> libs that integrate with Redux stores.