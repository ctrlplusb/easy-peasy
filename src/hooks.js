import { useState, useLayoutEffect, useContext } from 'react'
import shallowEqual from 'shallowequal'
import EasyPeasyContext from './context'
import { isObject } from './lib'

export function useStore(mapState) {
  const store = useContext(EasyPeasyContext)
  const [state, setState] = useState(mapState(store.getState()))
  useLayoutEffect(
    () =>
      store.subscribe(() => {
        const newState = mapState(store.getState())
        if (
          newState === state ||
          (isObject(newState) &&
            isObject(state) &&
            shallowEqual(newState, state))
        ) {
          // Do nothing
          return
        }
        setState(newState)
      }),
    [],
  )
  return state
}
export function useAction(mapActions) {
  const store = useContext(EasyPeasyContext)
  return mapActions(store.dispatch)
}
