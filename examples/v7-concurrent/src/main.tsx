import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from 'easy-peasy';

import App from './App';
import { store } from './store';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </StrictMode>,
);
