# RehydrateBoundary

This component is useful when making use of the [persist](/docs/api/persist.html) API along with an asynchronous storage engine.

When you rehydrate a persisted state from an asynchronous storage engine you may experience a flash of content where your application initially renders based on your stores default state, and then when the asynchronous operation to retrieve the state completes your application rerenders with the rehydrated state.

To improve your user's experience you can utilise this component to wait for the asynchronous rehydration of state to complete before rendering it's children. It additionally allows you to render a loading state whilst the asynchronous rehydration is being processed.

## Props

- `children` (ReactNode, *required*)

  The content to render after the asynchronous rehydration process has completed.

- `loading` (ReactNode, *optional*)

  Content to render whilst the asynchronous rehydration process is in progress.

## Example

In the example below, the `<Main />` content will not render until our store has been successfully updated with the rehydration state.

```javascript
import { RehydrateBoundary } from 'easy-peasy';

const store = createStore(persist(model, { storage: asyncStorageEngine });

ReactDOM.render(
  <StoreProvider store={store}>
    <div>
      <Header />
      <RehydrateBoundary>
        <Main />
      </RehydrateBoundary>
      <Footer />
    </div>
  </StoreProvider>,
  document.getElementById('app')
);
```