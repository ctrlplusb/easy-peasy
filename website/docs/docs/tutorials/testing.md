# Testing

This tutorial will cover _some_ (not all) testing strategies that you _could_
(not should) adopt. Of course, as with everything, the best testing strategy
will depend on your specific use case and needs.

- [Testing actions](#testing-actions)
- [Testing thunks](#testing-thunks)
  - [Strategy 1: mocking actions](#strategy-1-mocking-actions)
  - [Strategy 2: executing naturally](#strategy-2-executing-naturally)
- [Testing computed properties](#testing-computed-properties)
  - [Utilising initialState](#utilising-initialstate)
- [Testing listeners](#testing-listeners)
  - [Testing if listeners execute in response to target(s)](#testing-if-listeners-execute-in-response-to-targets)
  - [Testing if the listener performs as expected](#testing-if-the-listener-performs-as-expected)
- [Testing components](#testing-components)
  - [Utilising initialState to predefine state](#utilising-initialstate-to-predefine-state)
  - [Mocking calls to services](#mocking-calls-to-services)

## Testing actions

[Actions](/docs/api/action.html) are relatively simple to test as they are
essentially an immutable update to the [store](/docs/api/store.html). We can
therefore compare the prev and updated state to assert that our actions have had
the effect against our store's state.

Given the following model under test.

```typescript
import { action } from 'easy-peasy';

const todosModel = {
  items: {},
  add: action((state, payload) => {
    state.items[payload.id] = payload;
  }),
};
```

We could test it like so.

```typescript
test('add todo action', async () => {
  // arrange
  const todo = { id: 1, text: 'foo' };
  const store = createStore(todosModel);

  // act
  store.getActions().add(todo);

  // assert
  expect(store.getState().items).toEqual({ [todo.id]: todo });
});
```

## Testing thunks

[Thunks](/docs/api/thunk.html) are more complicated to test than
[actions](/docs/api/action.html) as they can perform side effects, such as
invoking network requests, and they can additionally dispatch other
[actions](/docs/api/action.html) or [thunks](/docs/api/thunk.html).

There are also 2 different strategies at testing thunks:

1. Mock actions dispatched by your thunks and assert that the expected thunks
   were called with the expected payloads
1. Allow thunks to execute naturally, asserting the state changes that may have
   occurred due to the actions being dispatched by your thunk

Each strategy has it's own merits and a pragmatic approach should be taken to
deciding which strategy would provide the most value on a case by case basis.

Within either of these strategies your thunks may perform side effects such as
making network requests. We highly recommend that you encapsulate these side
effects within modules that are then exposed to your store via the `injections`
configuration property of the store. Doing this will allow you to inject mocked
versions of your services when you are testing your
[thunks](/docs/api/thunk.html).

### Strategy 1: mocking actions

The `createStore` API contains a configuration property named `mockActions`,
which if set to `true`, will ensure that any action that is dispatched will not
be executed, and will instead be recorded - along with their payloads. You can
then access the recorded actions via the `getMockedActions` function that is
available on the store instance.

> We took inspiration for this strategy from the awesome
> [`redux-mock-store`](https://github.com/dmitry-zaets/redux-mock-store)
> package.

Given the following model under test:

```typescript
import { action, thunk } from 'thunk';

const todosModel = {
  items: {},
  fetchedTodo: action((state, payload) => {
    state.items[payload.id] = payload;
  }),
  fetchById: thunk(async (actions, payload, { injections }) => {
    const { todosService } = injections;
    const todo = await todosService.fetchById(payload);
    actions.fetchedTodo(todo);
  }),
};
```

We could test the `fetchById` thunk like so:

```typescript
import { createStore, actionName } from 'easy-peasy';

const createMockTodosService = (result) =>
  jest.fn(() => Promise.resolve({ json: () => Promise.resolve(response) }));

test('fetchById', async () => {
  // arrange
  const todo = { id: 1, text: 'Test my store' };
  const mockTodosService = {
    fetchById: jest.fn(() => Promise.resolve(todo)),
  };
  const store = createStore(todosModel, {
    injections: { todosService: mockTodosService },
    mockActions: true,
  });

  // act
  await store.getActions().fetchById(todo.id);

  // assert
  expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
  expect(store.getMockedActions()).toEqual([
    { type: '@thunk.fetchById(start)', payload: todo.id },
    { type: '@action.fetchedTodo', payload: todo },
    { type: '@thunk.fetchById(success)', payload: todo.id },
    { type: '@thunk.fetchById', payload: todo.id },
  ]);
});
```

### Strategy 2: executing naturally

Within the below tests we will not be mocking any actions. i.e. we will allow
thunks to execute naturally. This means that any actions that are called within
a thunk will be executed.

This provides more of an integration test as you are crossing boundaries,
executing actions outside of your thunk.

You would then generally make two different types of assertions within this
strategy:

1. Were the mocked injections called as expected?
2. Did the state get updated in the expected manner?

```javascript
test('fetchById', async () => {
  // arrange
  const todo = { id: 1, text: 'Test my store' };
  const mockTodosService = {
    fetchById: jest.fn(() => Promise.resolve(todo)),
  };
  const store = createStore(todosModel, {
    injections: { todosService: mockTodosService },
  });

  // act
  await store.getActions().fetchById(todo.id);

  // assert
  expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
  expect(store.getState()).toEqual({
    items: {
      1: todo,
    },
  });
});
```

## Testing computed properties

Computed properties are simply the result of a derive process applied to
existing state. Therefore one strategy would be to create versions of your store
with the `initialState` defined. You could then verify that the expected values
are derived by your computed properties.

Given the following model under test.

```typescript
import { computed } from 'easy-peasy';

const todosModel = {
  items: {},
  count: computed((state) => Object.keys(state.items).length),
};
```

We could test it like so.

```typescript
test('"count" is 0 when there are no items', async () => {
  // act
  const store = createStore(todosModel);

  // assert
  expect(store.getState().count).toEqual(0);
});
```

### Utilising initialState

You can also utilise the `initialState` configuration property of stores in
order to preload some initial state, which would allow you to wider testing of
your computed properties.

```javascript
test('"count" is 2 when there are 2 items', async () => {
  // act
  const store = createStore(todosModel, {
    // utilise initialState to preload our state
    initialState: {
      items: {
        1: 'foo',
        2: 'bar',
      },
    },
  });

  // assert
  expect(store.getState().count).toEqual(2);
});
```

## Testing listeners

When testing your listeners there are two types of tests that you can perform.

1. Do they execute when the configured target(s) execute?
2. Does the listener perform the expected?

### Testing if listeners execute in response to target(s)

For this case we recommend making use of the `mockAction` configuration value
that is available on the `createStore` configuration. When this is set then any
actions that are dispatched will not be executed, instead they will be recorded,
along with their payloads.

You can utilise the `getMockedActions` function that is bound against your store
instance to get the recorded actions, validating that they are what you expect.

This is perfect for us to establish that our listener was fired when a target
executed.

We will be showing an [actionOn](/docs/api/action-on.html) listener within this
test, however, this strategy would work equally well for a
[thunkOn](/docs/api/thunk-on.html) listener.

Given the following model.

```javascript
import { action, actionOn } from 'easy-peasy';

const model = {
  todos: [],
  logs: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  onTodoAdded: actionOn(
    (actions) => actions.addTodo,
    (state, target) => {
      state.logs.push(`Added todo: ${target.payload}`);
    },
  ),
};
```

We could test the `onTodoAdded` action.

```javascript
test('listener gets dispatched when target fires', () => {
  // arrange
  const store = createStore(model, {
    mockActions: true,
  });

  // act
  store.getActions().addTodo('Write docs');

  // assert
  expect(store.getMockedActions()).toMatchObject([
    { type: '@action.addTodo', payload: 'Write docs' },
    {
      type: '@action.onTodoAdded',
      payload: {
        type: '@action.addTodo',
        payload: 'Write docs',
      },
    },
  ]);
});
```

### Testing if the listener performs as expected

We may also want to test that our listeners perform the expected. It is possible
to dispatch our listeners manually by using the `store.getListeners()` API.

When dispatch a listener action it is important to note that a very specific
payload structure is expected. This payload becomes the `target` argument to the
listener handler.

Below is an overview of the payload object that you need to provide when
manually dispatching a listener action:

- `type` (string)

  The type of the target action being responded to. e.g.
  `"@actions.todos.addTodo"`

- `payload` (any)

  This will contain the same payload of the target action being responded to.

- `result` (any | null)

  When listening to a thunk, if the thunk succeeded and returned a result, the
  result will be contained within this property.

- `error` (Error | null)

  When listening to a thunk, if the thunk failed, this property will contain the
  `Error`.

- `resolvedTargets` (Array\<string\>)

  An array containing a list of the resolved targets, resolved by the
  `targetResolver` function. This aids in performing target based logic within a
  listener handler.

You need not provide all the values if you know that your listener only uses
some of them. You could instead only populate the parts of the `target` object
that you expect your listener to be using.

For example, below we will manually dispatch a listener, providing only the
payload.

```javascript
store.getListeners().onTodoAdded({
  payload: 'Write docs on testing',
});
```

Once you take these rules into account, you could then follow a similar strategy
to [testing actions](/docs/testing/testing-actions.html) for
[actionOn](/docs/api/action-on.html) listeners. Equally, you can follow a
similar strategy to [testing thunks](/docs/testing/testing-thunks.html) for
[thunkOn](/docs/api/thunk-on.html) listeners.

Below we will show an example of how you could test the `onTodoAdded` action
that we described within the model above.

```javascript
test('onTodoAdded adds a log entry', () => {
  // arrange
  const store = createStore(model);

  // act
  store.getListeners().onTodoAdded({
    payload: 'Test listeners',
  });

  // assert
  expect(store.getState().logs).toEqual(['Added todo: Test listeners']);
});
```

## Testing components

When testing your components I strongly recommend the approach recommended by
Kent C. Dodd's awesome [Testing Javascript](https://testingjavascript.com/)
course, where you try to test the behaviour of your components using a natural
DOM API, rather than reaching into the internals of your components.

He has published a very useful package by the name of
[`@testing-library/react`](https://github.com/testing-library/react-testing-library)
which allows us to follow this paradigm whilst providing very useful mechanisms
by which to interact with the DOM created by our React components.

Imagine we were trying to test the following component.

```typescript
function Counter() {
  const count = useStoreState((state) => state.count);
  const increment = useStoreActions((actions) => actions.increment);
  return (
    <div>
      Count: <span data-testid="count">{count}</span>
      <button type="button" onClick={increment}>
        +
      </button>
    </div>
  );
}
```

As you can see it is making use of our hooks to gain access to state and actions
of our store.

We could adopt the following strategy to test it.

```typescript
import { render } from '@testing-library/react';
import { createStore, StoreProvider } from 'easy-peasy';
import model from './model';

test('Counter', () => {
  // arrange
  const store = createStore(model);
  const app = (
    <StoreProvider store={store}>
      <ComponentUnderTest />
    </StoreProvider>
  );

  // act
  const { getByTestId, getByText } = render(app);

  // assert
  expect(getByTestId('count').textContent).toEqual('0');

  // act
  fireEvent.click(getByText('+'));

  // assert
  expect(getByTestId('count').textContent).toEqual('1');
});
```

As you can see we create a store instance in the context of our test and wrap
the component under test with the `StoreProvider`. This allows our component to
act against our store.

We then interact with our component using the DOM API exposed by the render.

This grants us great power in being able to test our components with a great
degree of confidence that they will behave as expected.

### Utilising initialState to predefine state

It is also possible to preload your store with some state by utilising the
`initialState` configuration property of the store. This may help you test
specific conditions of your component.

```javascript
test('Counter', () => {
  // arrange
  const store = createStore(model, { initialState: initialStateForTest });

  // ...
});
```

### Mocking calls to services

If your thunks make calls to external services we recommend encapsulating these
services within a module and then exposing them to your store via the
`injection` configuration property of the store. Doing this will allow you to
easily inject mock versions of your services when testing them.

```javascript
test('saving a todo', () => {
  // arrange
  const mockTodoService = {
    save: jest.fn(),
  };
  const store = createStore(model, {
    injections: {
      todoService: mockTodoService,
    },
  });

  // ...
});
```
