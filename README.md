<p>&nbsp;</p>
<p align='center'>
  <img src="./website/docs/assets/logo-small.png" width="150" />
</p>
<p align='center'><strong>Vegetarian friendly state for React</strong></p>
<p>&nbsp;</p>

[![npm](https://img.shields.io/npm/v/easy-peasy.svg?style=flat-square)](http://npm.im/easy-peasy)
[![MIT License](https://img.shields.io/npm/l/easy-peasy.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/easy-peasy.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/easy-peasy)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/easy-peasy.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/easy-peasy)

<p>Easy Peasy is an abstraction of Redux, providing a reimagined API that focuses on <strong>developer experience</strong>. It allows you to <strong>quickly</strong> and <strong>easily</strong> manage your state, whilst leveraging the strong <strong>architectural guarantees</strong> and extensive <strong>eco-system</strong> that Redux has to offer.</p>

<ul>
  <li>Zero configuration</li>
  <li>No boilerplate</li>
  <li>React hooks based API</li>
  <li>Extensive TypeScript support</li>
  <li>Encapsulate data fetching</li>
  <li>Computed properties</li>
  <li>Reactive actions</li>
  <li>Redux middleware support</li>
  <li>State persistence</li>
  <li>Redux Dev Tools</li>
  <li>Global, context, or local stores</li>
  <li>Built-in testing utils</li>
  <li>React Native supported</li>
  <li>Hot reloading supported</li>
</ul>

<p>&nbsp;</p>

All of this comes via a single dependency install.

```
npm install easy-peasy
```

<p>&nbsp;</p>

## Fly like an eagle

**Create your store**

```javascript
const store = createStore({
  todos: {
    items: ['Create store', 'Wrap application', 'Use store'],
    add: action((state, payload) => {
      state.items.push(payload);
    }),
  },
});
```

**Wrap your application**

```javascript
function App() {
  return (
    <StoreProvider store={store}>
      <TodoList />
    </StoreProvider>
  );
}
```

**Use the store**

```javascript
function TodoList() {
  const todos = useStoreState((state) => state.todos.items);
  const add = useStoreActions((actions) => actions.todos.add);
  return (
    <div>
      {todos.map((todo, idx) => (
        <div key={idx}>{todo}</div>
      ))}
      <AddTodo onAdd={add} />
    </div>
  );
}
```

<p>&nbsp;</p>

## Our Sponsors ❤️

We have only but great appreciation to those who support this project. If you
have the ability to help contribute towards the continued maintenance and
evolution of this library then please consider
[[becoming a sponsor](https://opencollective.com/easy-peasy#backer)].

<a href="https://opencollective.com/easy-peasy#backers">
    <img src="https://opencollective.com/easy-peasy/backers.svg?width=950" />
</a>

<p>&nbsp;</p>

## Documentation

See the [official website](https://easy-peasy.dev) for tutorials, docs, recipes,
and more.

<p>&nbsp;</p>

## OS Awards Nominee

Easy Peasy was nominated under the "Productivity Booster" category.
