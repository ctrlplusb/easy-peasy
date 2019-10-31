import { useEffect, useState } from 'react';
import { useStore } from './hooks';

export default function RehydrateBoundary({ children, loading = null }) {
  const store = useStore();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    store.persist.resolveRehydration().then(() => setReady(true));
  }, []);
  return ready ? children : loading;
}
