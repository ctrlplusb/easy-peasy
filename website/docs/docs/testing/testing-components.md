# Testing components

When testing your components I strongly recommend the approach recommended by Kent C. Dodd's awesome [Testing Javascript](https://testingjavascript.com/) course, where you try to test the behaviour of your components using a natural DOM API, rather than reaching into the internals of your components. He has published a very useful package by the name of [`@testing-library/react`](https://github.com/testing-library/react-testing-library) to help us do so. The tests below shall be adopting this package and strategy.

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

Some other strategies that you could employ whilst using this pattern include:

  - Providing an initial state to your store within the test.

    ```typescript
    test('Counter', () => {
      // arrange
      const store = createStore(model, { initialState: initialStateForTest })

      // ...
    })
    ```

  - Utilising the `injections` and `mockActions` configurations of the `createStore` to avoid performing actions with side effects in your test.

There is no one way to test your components, but it is good to know of the tools available to you. However you choose to test your components, I do recommend that you try to test them as close to their real behaviour as possible - i.e. try your best to prevent implementation details leaking into your tests.