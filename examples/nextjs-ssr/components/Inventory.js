import { useStoreState, useStoreActions } from 'easy-peasy'

export default function Inventory() {
    const items = useStoreState(state => state.inventory.items)
    const addToBasket = useStoreActions(actions => actions.shop.addItem)

    return (
        <div style={{ margin: '2rem' }}>
            <h1>Items</h1>
            <ul>
                {items.map((item, index) =>
                    <li key={index}>
                        <span>{item}</span>
                        <button onClick={() => addToBasket(item)}>Add to basket</button>
                    </li>
                )}
            </ul>
        </div>
    )
}