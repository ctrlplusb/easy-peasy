# persist

redux-persist unfortunately doesn't lend itself to nicely integrate with easy-peasy. 

I've had some long standing ideas and believe now it is time to act on them.

I am investigating the addition of a native `persist` helper to easy-peasy. This would make in fundamentally simple to add this behaviour to your stores.

A few off the cuff examples of what I have in mind in terms of API.

```javascript
import { persist } from 'easy-peasy';
//         👆 import the helper

// Then you wrap a model with the helper to indicate that you would like
// to persist

// persist all
let model = persist({
  counter: 0,
  todos: [],
  increment: (state) => {
    state.counter += 1;
  }
});

// select keys to persist via whitelist
model = persist(
  {
    counter: 0,
    todos: [],
    increment: (state) => {
      state.counter += 1;
    }
  }, 
  // secondary argument is a configuration:
  {
    whitelist: ['counter'],
  }
);

// ignore keys to persist via blacklist
model = persist(
  {
    counter: 0,
    todos: [],
    increment: (state) => {
      state.counter += 1;
    }
  }, 
  {
    blacklist: ['todos'],
  }
);

// persist at any depth within the model
model = {
  counter: 0,
  todos: [],
  increment: (state) => {
    state.counter += 1;
  },
  session: persist({
    user: null,
    login: thunk(/* ... */)
  })
}

// you can also specify multiple persist configurations, including nested
model = persist({
  counter: 0,
  todos: [],
  increment: (state) => {
    state.counter += 1;
  },
  session: persist(
    {
      user: null,
      token: null,
      login: thunk(/* ... */)
    },
    {
      whitelist: ['token']
    }
  )
}

// full set of configuration values available:
model = persist(
  { 
    counter: 0,
    todos: [],
    increment: (state) => {
      state.counter += 1;
    },
  }, 
  {
    // list of middleware that will be applied to data prior to persist.
    // they get run left to right
    // this emulates the behaviour of "transforms" by redux-persis
    persistMiddleware: [
      (key, data) => data 
    ],
    // list of middleware that will be applied to data prior to rehydration.
    // they get run left to right
    // this emulates the behaviour of "transforms" by redux-persis
    rehydrateMiddleware: [
      (key, data) => data 
    ],
    // isolate the data keys to persist via...
    whitelist: ['counter'],
    // set data keys to be ignore skipped...
    blacklist: ['todos'],
    // specify a custom storage engine
    // we will have built in ones for sessionStorage and localStorage
    // default is localStorage
    storage: MemoryStorage,
    // specify a strategy to be used for rehydration
    mergeStrategy: 'overwrite', // or 'merge' or 'mergeDeep'
  }
)

// pass into the store
const store = createStore(model);

// the store will have additional APIs to work with peristence
store.persist.commit(); // commit outstanding changes to persistence
store.persist.clear(); // remove current data in persistence
// I don't see the value in having a pause/resume API similar to redux-persist

// when rendering your application the StoreProvider will wait for all 
// data to be rehydrated prior to rendering it's children
const app = (
  <StoreProvider store={store}>
    <MyApp />
  </StoreProvider>
) 
```

I am still of two minds on whether we should support a PersistGate like component as is available via redux-persist. This could be added at a later stage though I suppose? I believe it would only be useful in cases where the storage engine being used has asynchronous rehydration.

Thoughts?