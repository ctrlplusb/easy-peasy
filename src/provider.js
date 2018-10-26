import React from 'react'
import PropTypes from 'prop-types'
import EasyPeasyContext from './context'

const EasyPeasyProvider = ({ children, store }) => (
  <EasyPeasyContext.Provider value={store}>
    {children}
  </EasyPeasyContext.Provider>
)

EasyPeasyProvider.propTypes = {
  children: PropTypes.node.isRequired,
  store: PropTypes.object.isRequired,
}

export default EasyPeasyProvider
