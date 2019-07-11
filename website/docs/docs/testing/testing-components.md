# Testing components

When testing your components I strongly recommend the approach recommended by Kent C. Dodd's awesome [Testing Javascript](https://testingjavascript.com/) course, where you try to test the behaviour of your components using a natural DOM API, rather than reaching into the internals of your components. 

He has published a very useful package by the name of [`@testing-library/react`](https://github.com/testing-library/react-testing-library) which allows us to follow this paradigm whilst providing very useful mechanisms by which to interact with the DOM created by our React components. 

The tests below shall be adopting this package and strategy.

## Example

Imagine we were trying to test the following component.

```typescript
function Counter() {
  const count = useStoreState(state => state.count)
  const increment = useStoreActions(actions => actions.increment)
  return (
    <div>
      Count: <span data-testid="count">{count}</span>
      <button type="button" onClick={increment}>
        +
      </button>
    </div>
  )
}
```

As you can see it is making use of our hooks to gain access to state and actions of our store.

We could adopt the following strategy to test it.

```typescript
import { createStore, StoreProvider } from 'easy-peasy'
import model from './model';

test('Counter', () => {
  // arrange
  const store = createStore(model)
  const app = (
    <StoreProvider store={store}>
      <ComponentUnderTest />
    </StoreProvider>
  )

  // act
  const { getByTestId, getByText } = render(app)

  // assert
  expect(getByTestId('count').textContent).toEqual('0')

  // act
  fireEvent.click(getByText('+'))

  // assert
  expect(getByTestId('count').textContent).toEqual('1')
})
```

As you can see we create a store instance in the context of our test and wrap the component under test with the `StoreProvider`. This allows our component to act against our store.

We then interact with our component using the DOM API exposed by the render.

This grants us great power in being able to test our components with a great degree of confidence that they will behave as expected.

## Utilising initialState to predefine state

It is also to preload your store with some state by utilising the `initialState` configuration property of the store. This may help you test specific conditions of your component.
  
```javascript
test('Counter', () => {
  // arrange
  const store = createStore(model, { initialState: initialStateForTest })

  // ...
})
```

## Mocking calls to services

If your thunks make calls to external services we recommend encapsulating these services within a module and then exposing them to your store via the `injection` configuration property of the store. Doing this will allow you to easily inject mock versions of your services when testing them.

```javascript
test('saving a todo', () => {
  // arrange
  const mockTodoService = {
    save: jest.fn()
  };
  const store = createStore(model, { 
    injections: {
      todoService: mockTodoService
    }
  });

  // ...
})

```
