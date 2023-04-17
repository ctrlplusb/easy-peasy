import { StoreProvider } from 'easy-peasy';
import { useStore } from '../store/store';

export default function WrappedApp({ Component, pageProps }) {
  const store = useStore(pageProps.serverStoreState);

  return (
    <StoreProvider store={store}>
      <Component {...pageProps} />
    </StoreProvider>
  );
}
