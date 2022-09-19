import { StoreProvider } from 'easy-peasy';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/App';
import store from './store';

import './index.css';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </StrictMode>,
);
