import { useState, useEffect, useMemo, useContext } from 'react'
import EasyPeasyContext from './context'

export function useStore(mapState) {
  const store = useContext(EasyPeasyContext)
  const [state, setState] = useState(mapState(store.getState()))
  const result = useMemo(() => state, [state])
  useEffect(() => store.subscribe(() => setState(mapState(store.getState()))))
  return result
}

export function useAction(mapActions) {
  const store = useContext(EasyPeasyContext)
  return mapActions(store.dispatch)
}
