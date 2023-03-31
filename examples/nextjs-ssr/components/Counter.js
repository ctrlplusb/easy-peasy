import { useStoreState, useStoreActions } from "easy-peasy";

export default function Counter() {
  const count = useStoreState((state) => state.counter.count);
  const increment = useStoreActions((actions) => actions.counter.increment);

  return (
    <div style={{ margin: "2rem" }}>
      <h1>Counter</h1>
      <p>value = {count}</p>
      <button onClick={increment}>Increment counter</button>
    </div>
  );
}
