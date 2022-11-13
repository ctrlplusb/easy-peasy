---
pageClass: homepage
---

<p align="center">
  <img src="./assets/logo-small.png" width="150" />
</p>
<h1 class="title" align="center">Vegetarian friendly state for React</h1>

<p>Easy Peasy is an abstraction of Redux, providing a reimagined API that focuses on <strong>developer experience</strong>. It allows you to <strong>quickly</strong> and <strong>easily</strong> manage your state, whilst leveraging the strong <strong>architectural guarantees</strong> and extensive <strong>eco-system</strong> that Redux has to offer.</p>

<div style="display: flex;">
  <div style="width: 50%">
    <ul>
      <li>Zero configuration</li>
      <li>No boilerplate</li>
      <li>React hooks based API</li>
      <li>Extensive TypeScript support</li>
      <li>Encapsulate data fetching</li>
      <li>Computed properties</li>
      <li>Reactive actions</li>
    </ul>
  </div>
  <div style="width: 50%">
    <ul>
      <li>Redux middleware support</li>
      <li>State persistence</li>
      <li>Redux Dev Tools</li>
      <li>Global, context, or local stores</li>
      <li>Built-in testing utils</li>
      <li>React Native supported</li>
      <li>Hot reloading supported</li>
    </ul>
  </div>
</div>

All of this comes via a single dependency install.

```bash
npm install easy-peasy
```

<h2 class="subtitle">Fly like an eagle</h2>

**Create your store**

```javascript
const store = createStore({
  todos: ['Create store', 'Wrap application', 'Use store'],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
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
  const todos = useStoreState((state) => state.todos);
  const addTodo = useStoreActions((actions) => actions.addTodo);
  return (
    <div>
      {todos.map((todo, idx) => (
        <div key={idx}>{todo}</div>
      ))}
      <AddTodo onAdd={addTodo} />
    </div>
  );
}
```

<h2 class="subtitle">OS Awards Nominee</h2>
<p>Easy Peasy was nominated under the "Productivity Booster" category. The following screencast will be presented during the awards ceremony at the React Summit 2020 conference.</p>

<video class="screencast" controls>
  <source src="./assets/screencast.mp4" type="video/mp4">
</video>

<h2 class="subtitle">Core Team</h2>

<table>
  <tr>
  <td>
    <a href="https://github.com/no-stack-dub-sack">
      <img src="https://avatars.githubusercontent.com/u/18563015?v=4" width="100px;" alt=""/>
      <br />
      <sub><b>Peter Weinberg</b></sub>
    </a>
  </td>
  <td>
    <a href="https://github.com/jmyrland">
      <img src="https://avatars.githubusercontent.com/u/837651?v=5" width="100px;" alt="Jørn A. Myrland"/>
      <br />
      <sub><b>Jørn A. Myrland</b></sub>
    </a>
  </td>
  <td>
    <a href="https://github.com/ctrlplusb">
      <img src="https://avatars.githubusercontent.com/u/12164768?v=4" width="100px;" alt="Sean Matheson"/>
      <br />
      <sub><b>Sean Matheson</b></sub>
    </a>
  </td>
  </tr>
</table>

<h2 class="subtitle">Our Sponsors ❤️</h2>

We have only but great appreciation to those who support this project. If you
have the ability to help contribute towards the continued maintenance and
evolution of this library then please consider
[[becoming a sponsor](https://opencollective.com/easy-peasy#backer)].

<a href="https://opencollective.com/easy-peasy#backers">
    <img src="https://opencollective.com/easy-peasy/backers.svg?width=950" />
</a>

<p class="action">
  <a href="/docs/tutorials/quick-start.html" class="action-button">Quick Start</a>
</p>
