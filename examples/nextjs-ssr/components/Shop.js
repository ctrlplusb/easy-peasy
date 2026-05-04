import React from 'react'
import { useStoreState, useStoreRehydrated } from 'easy-peasy'

export default function Shop() {
    useStoreRehydrated()
    const basket = useStoreState(state => state.shop.basket)

    return (
        <div style={{ margin: '2rem' }}>
            <h1>Basket</h1>
            <ul>
                {Object.entries(basket).map(([item, quantity], index) =>
                    <li key={index}>{item} x {quantity}</li>
                )}
            </ul>
        </div>
    )
}
