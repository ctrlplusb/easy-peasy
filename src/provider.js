import React from 'react';
import StoreContext from './context';

export function StoreProvider({ children, store }) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}
