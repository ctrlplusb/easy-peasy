import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, StoreProvider } from 'easy-peasy';
import defaultStoreModel from '../store/model';

/**
 * Creates a function to wrap a component with a store provider, based on the given
 * model or factory.
 *
 * Example with default model:
 * ```
 *   const withStore = createWithStore(model);
 * ```
 *
 * Example with store factory:
 * ```
 *   const withStore = createWithStore(() => createStore(model, { injections: mockInjections }))
 * ```
 *
 * Then the `withStore` can be used to wrap a component with a store provider, i.e:
 * ```
 *   render(withStore(<Example />))
 * ```
 */
export const createWithStore = (defaultModelOrFactory: any | (() => any)) => {
  const defaultModel =
    defaultModelOrFactory instanceof Function ? undefined : defaultModelOrFactory;
  const storeFactory =
    defaultModelOrFactory instanceof Function ? defaultModelOrFactory : createStore;

  return (ui: React.ReactElement, store: any = storeFactory(defaultModel)) => (
    <StoreProvider store={store}>{ui}</StoreProvider>
  );
};

interface ISetupProps {
  model?: any;
  store?: void;
  withStore?: (ui: React.ReactElement, store?: any) => React.ReactElement;
}

interface ISetupWithStore extends ISetupProps {
  store: any;
  model?: void;
}
export type SetupProps = ISetupProps | ISetupWithStore;

/**
 * Use this function to setup `ui` with a given store/model. Helpers are returned.
 *
 * Example with default model:
 * ```
 *   const { container, user } = setup(<App />);
 * ```
 *
 * Example with a specific model:
 * ```
 *   const { container, user } = setup(<App />, { model });
 * ```
 *
 * Example with a specific store:
 * ```
 *   const store = createStore(model);
 *   const { container, user } = setup(<App />, { store });
 * ```
 */
export const setup = (
  ui: React.ReactElement,
  {
    model = defaultStoreModel,
    store = undefined,
    withStore = createWithStore(model),
  }: SetupProps = {},
) => ({
  user: userEvent.setup(),
  ...screen,
  ...render(withStore(ui, store)),
});
