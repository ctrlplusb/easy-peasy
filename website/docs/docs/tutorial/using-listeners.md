# Using listeners

Our [application](https://codesandbox.io/s/easy-peasy-tutorial-computed-uohgr) is looking pretty well rounded, having introduced [computed](/docs/api/computed.html) properties. We have covered most of the Easy Peasy API, but there is still one powerful concept you should be aware of; listeners.

Easy Peasy provides [actionOn](/docs/api/action-on.html) and [thunkOn](/docs/api/thunk-on.html) APIs which allow you to declare an action/thunk which is fired in response to target actions being executed - i.e. listeners.

This allows for an interesting reactive model that can solve use cases like being able to clear up your state when a user logs out, or keeping a simple audit log of important actions that have been performed by a user.

To illustrate how these listeners work we will add a basic audit log to our application.

## Adding an audit model

Let's start by creating a simple model to represent the state of our audit log.

```javascript
// src/models/audit-model.js

const auditModel = {
  logs: [],
};

export default auditModel;
```

Then add the `auditModel` to our store model.

```diff
// src/model/index.js

import productsModel from './products-model';
import basketModel from './basket-model';
+ import auditModel from './audit-model';

const storeModel = {
  products: productsModel,
  basket: basketModel,
+  audit: auditModel,
};

export default storeModel;
```

## The AuditLog component

Next up let's create a simple `AuditLog` component which we will use to render the logs.

```javascript
// src/components/audit-log.js

import React from 'react';
import { useStoreState } from 'easy-peasy';

export default function AuditLog() {
  const logs = useStoreState(state => state.audit.logs);
  return (
    <pre>
      <code>{logs.join('\n')}</code>
    </pre>
  );
}
```

And then ensure our `AuditLog` component is rendered within our `App`.

```diff
// src/components/app.js

import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Basket from './basket';
import Header from './header';
import Product from './product';
import ProductList from './product-list';
+ import AuditLog from './audit-log';

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Switch>
          <Route path="/" exact component={ProductList} />
          <Route
            path="/product/:id"
            render={({ match }) => (
              <Product id={parseInt(match.params.id, 10)} />
            )}
          />
          <Route path="/basket" exact component={Basket} />
        </Switch>
+        <AuditLog />
      </div>
    </BrowserRouter>
  );
}
```

Great! We have the mechanisms by which to store and render logs, however, we haven't included any logic by which to add a audit log entries.

## Adding an actionOn listener

Let's add an [actionOn](/docs/api/action-on.html) listener which we will configure to execute any time a product is added to our basket.

We'll extend our `auditModel` directly with this listener.

```javascript
import { actionOn } from 'easy-peasy';
//          👆

const auditModel = {
  logs: [],

  // 👇 the listener
  onAddToBasket: actionOn(
    // targetResolver function, resolving the addedProduct action as our target
    //                                                👇
    (actions, storeActions) => storeActions.basket.addedProduct,

    // action handler which gets executed when our target action executes
    (state, target) => {
      state.logs.push(`Added product to basket: ${target.payload}`);
      //                                                    👆
      // receives a target obj containing the payload of the target
    },
  ),
};

export default auditModel;
```

Note how the first parameter of [actionOn](/docs/api/action-on.html) is a `resolverFunction` which receives both the local actions as well as the store actions. We used the store actions to resolve the `addedProduct` action as our target.

The second parameter to our [actionOn](/docs/api/action-on.html)  listener is the action handler itself,  which will be executed every time our target `addedProduct` action has fired. The action handler will receive as it's first argument the local `state` (i.e. audit model state), allowing us to update it. It's second argument is a `target` object containing the following properties:

- `payload`: The same payload that the target received
- `type`: The fully qualified action type of the target being responded to

There are some additional properties, however, we won't cover them here. Read the API docs for [actionOn](/docs/api/action-on.html) and [thunkOn](/docs/api/thunk-on.html) for full specifications as well as further use cases.

Our action handler uses the payload to create an entry to our audit log, recording the id of the product that was added to our basket.

After you make this change you will be able to run your application and add a product to your basket. You should note that audit logs being rendered onto the page. Success. 🎉

## Review

Listeners are a very powerful concept which allow us to keep a nice separation of concerns. It would feel awkward and cumbersome if we were forced to dispatch actions from all over our model which would ensure our audit logs got updated appropriately. Using a listener approach we can centralise all the configuration around which actions we would like to target and update our audit logs with.

In the final section we will introduce a very cool tool allowing you to visualise and debug your global store - the Redux Dev Tools extension.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-listeners-rhni3).

