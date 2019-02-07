import { useState, useEffect, useContext, useRef } from 'react'
import shallowEqual from 'shallowequal'
import EasyPeasyContext from './context'
import { isStateObject } from './lib'

export function useStore(mapState, dependencies = []) {
  const store = useContext(EasyPeasyContext)
  const [state, setState] = useState(mapState(store.getState()))
  // As our effect only fires on mount and unmount it won't have the state
  // changes visible to it, therefore we use a mutable ref to track this.
  const stateRef = useRef(state)
  // Helps avoid firing of events when unsubscribed, i.e. unmounted
  const isActive = useRef(true)
  useEffect(() => {
    const calculateState = () => {
      const newState = mapState(store.getState())
      isActive.current = true
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
        if (isActive.current) {
          setState(newState)
        }
      })
    }
    calculateState()
    const unsubscribe = store.subscribe(calculateState)
    return () => {
      unsubscribe()
      isActive.current = false
    }
  }, dependencies)
  return state
}

let warnedAboutUseActionDeprecation = false

export function useAction(mapActions) {
  if (!warnedAboutUseActionDeprecation) {
    warnedAboutUseActionDeprecation = true
    // eslint-disable-next-line no-console
    console.warn(
      'Easy Peasy: the "useAction" hook has been deprecated and will be removed in the next major release. We recommend using the "useActions" hook instead.',
    )
  }
  const store = useContext(EasyPeasyContext)
  return mapActions(store.dispatch)
}

export function useActions(mapActions) {
  const store = useContext(EasyPeasyContext)
  return mapActions(store.dispatch)
}

export function useDispatch() {
  const store = useContext(EasyPeasyContext)
  return store.dispatch
}

export function createTypedHooks() {
  return {
    useActions,
    useAction,
    useDispatch,
    useStore,
  }
}
