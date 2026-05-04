import type { Product } from './model';

const SEED: Product[] = [
  { id: 'p1', name: 'Bananas', category: 'Fruit', price: 2.5 },
  { id: 'p2', name: 'Sourdough Loaf', category: 'Bakery', price: 6.0 },
  { id: 'p3', name: 'Almond Milk', category: 'Dairy', price: 4.25 },
  { id: 'p4', name: 'Carrots', category: 'Veg', price: 1.8 },
  { id: 'p5', name: 'Olive Oil', category: 'Pantry', price: 11.5 },
  { id: 'p6', name: 'Apples', category: 'Fruit', price: 3.2 },
];

export async function fetchProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return SEED;
}
