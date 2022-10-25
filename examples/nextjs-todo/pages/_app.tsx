import type { AppProps } from 'next/app'
import { StoreProvider } from 'easy-peasy';
import store from '../store';

function MyApp({ Component, pageProps }: AppProps) {
  return <StoreProvider store={store}>
    <Component {...pageProps} />
  </StoreProvider>
}

export default MyApp
