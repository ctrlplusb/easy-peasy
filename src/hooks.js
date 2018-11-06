import { useState, useEffect, useContext } from 'react'
import shallowEqual from 'shallowequal'
import EasyPeasyContext from './context'
import { isObject } from './lib'

export function useStore(mapState) {
  const store = useContext(EasyPeasyContext)
  const [state, setState] = useState(mapState(store.getState()))
  useEffect(() => {
    let stateCache = state
    return store.subscribe(() => {
      const newState = mapState(store.getState())
      if (
        newState === stateCache ||
        (isObject(newState) &&
          isObject(stateCache) &&
          shallowEqual(newState, stateCache))
      ) {
        // Do nothing
        return
      }
      stateCache = newState
      setState(newState)
    })
  }, [])
  return state
}
export function useAction(mapActions) {
  const store = useContext(EasyPeasyContext)
  return mapActions(store.dispatch)
}
