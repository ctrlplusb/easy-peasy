import { useState, useEffect, useContext, useRef } from 'react'
import shallowEqual from 'shallowequal'
import EasyPeasyContext from './context'
import { isStateObject } from './lib'

export function useStore(mapState) {
  const store = useContext(EasyPeasyContext)
  const [state, setState] = useState(mapState(store.getState()))
  // As our effect only fires on mount and unmount it won't have the state
  // changes visible to it, therefore we use a mutable ref to track this.
  const stateRef = useRef(state)
  useEffect(
    () =>
      store.subscribe(() => {
        const newState = mapState(store.getState())
        if (
          newState === stateRef.current ||
          (isStateObject(newState) &&
            isStateObject(stateRef.current) &&
            shallowEqual(newState, stateRef.current))
        ) {
          // Do nothing
          return
        }
        stateRef.current = newState
        setTimeout(() => setState(newState))
      }),
    [],
  )
  return state
}
export function useAction(mapActions) {
  const store = useContext(EasyPeasyContext)
  return mapActions(store.dispatch)
}
