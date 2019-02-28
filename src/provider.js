import React from 'react';
import PropTypes from 'prop-types';
import StoreContext from './context';

const StoreProvider = ({ children, store }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
  store: PropTypes.object.isRequired,
};

export default StoreProvider;
