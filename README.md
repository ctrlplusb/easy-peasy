<p>&nbsp;</p>
<p align='center'>
  <img src="https://i.imgur.com/UnPLVly.png" width="280" />
</p>
<p align='center'>Vegetarian friendly state for React</p>
<p>&nbsp;</p>

[![npm](https://img.shields.io/npm/v/easy-peasy.svg?style=flat-square)](http://npm.im/easy-peasy)
[![MIT License](https://img.shields.io/npm/l/easy-peasy.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/easy-peasy.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/easy-peasy)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/easy-peasy.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/easy-peasy)


Easy Peasy provides you with an <strong>intuitive</strong> API to <strong>quickly</strong> and <strong>easily</strong> manage the state for your React application. Batteries are included - <strong>no configuration</strong> is required to support derived state, API calls, developer tools etc.

```
npm install easy-peasy
```

<p>&nbsp;</p>

**Step 1 - Create the store**

```javascript
const storeModel = model({
  todos: ['Create store', 'Wrap application', 'Use store'],
  addTodo: action((state, payload) => {
    state.add.push(payload)
  })
});

const store = createStore(storeModel);
```

**Step 2 - Wrap your app**

```javascript
function App() {
  return (
    <StoreProvider store={store}>
      <TodoList />
    </StoreProvider>
  );
}
```

**Step 3 - Use the store**

```javascript
function TodoList() {
  const todos = useStoreState(state => state.todos);
  const addTodo = useStoreActions(actions => actions.addTodo);
  return (
    <div>
      {todos.map((todo, idx) => <div key={idx}>{todo}</div>)}
      <AddTodo onAdd={addTodo} />
    </div>
  );
}
```

## Features

  - Zero config setup
  - No boilerplate
  - React hooks based API
  - Computed properties - i.e. derived data
  - Data fetching / side effects
  - Persist state to session/local storage
  - Testing helpers
  - Extensive TypeScript support
  - Global, shared, or component level stores
  - React Native supported
  - Redux Dev Tools supported
  - Hot Reloading supported

## Documentation

See the [official website](https://easy-peasy.now.sh) for tutorials, API docs, recipes, and more.

## Backers ❤️

Extreme gratitude to all our backers! [[Become a backer](https://opencollective.com/easy-peasy#backer)].

<a href="https://opencollective.com/easy-peasy#backers">
    <img src="https://opencollective.com/easy-peasy/backers.svg?width=950" />
</a>
