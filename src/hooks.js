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
  const isMounted = useRef(true)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
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
      // The settimeout wrap fixes a strange issue where a setState would
      // fire but the associated hook wouldn't receive it. It's almost as
      // if the effect was handled in a synchronous manner in some part of
      // the React reconciliation process that ended up with it not
      // propagating
      setTimeout(() => {
        if (isMounted.current) {
          setState(newState)
        }
      })
    })
    return () => {
      unsubscribe()
      isMounted.current = false
    }
  }, [])
  return state
}
export function useAction(mapActions) {
  const store = useContext(EasyPeasyContext)
  return mapActions(store.dispatch)
}
