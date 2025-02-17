import { StoreProvider } from 'easy-peasy';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import store from './store';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
);
