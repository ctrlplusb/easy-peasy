import { useState, useEffect, useContext } from 'react'
import shallowEqual from 'shallowequal'
import EasyPeasyContext from './context'
import { isObject } from './lib'

export function useStore(mapState) {
  const store = useContext(EasyPeasyContext)
  const localState = useState(mapState(store.getState()))
  useEffect(() =>
    store.subscribe(() => {
      const [state, setState] = localState
      const newState = mapState(store.getState())
      if (
        newState === state ||
        (isObject(newState) && isObject(state) && shallowEqual(newState, state))
      ) {
        // Do nothing
        return
      }
      setState(newState)
    }),
  )
  return localState[0]
}
export function useAction(mapActions) {
  const store = useContext(EasyPeasyContext)
  return mapActions(store.dispatch)
}
