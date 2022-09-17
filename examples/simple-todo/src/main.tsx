import { StoreProvider } from 'easy-peasy';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import store from './store';

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
