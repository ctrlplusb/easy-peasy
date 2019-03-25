import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import StoreContext from './context';

const createCtx = store => {
  const callbackMap = {};
  return {
    addListener: (id, fn) => {
      callbackMap[id] = fn;
    },
    removeListener: id => {
      const listener = callbackMap[id];
      if (listener) {
        delete callbackMap[id];
      }
    },
    getListeners: () => Object.values(callbackMap),
    store,
  };
};

const StoreProvider = ({ children, store }) => {
  const ctx = useMemo(() => createCtx(store), [store]);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      ctx.getListeners().map(fn => fn(state));
    });
    return unsubscribe;
  });
  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
  store: PropTypes.object.isRequired,
};

export default StoreProvider;
