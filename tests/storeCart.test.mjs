import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCart, cartTotals, MAX_QUANTITY } from '../src/lib/storeCart.js';

const products = [
  { id: 'a', price: 399, originalPrice: 650 },
  { id: 'b', price: 400, originalPrice: 700 },
  { id: 'consult', price: 499, originalPrice: 899, consult: true },
];

test('an empty bag has no delivery charge', () => {
  assert.deepEqual(cartTotals([], products), { lines: [], count: 0, subtotal: 0, savings: 0, delivery: 0, total: 0 });
});
test('paid delivery below threshold is included in the order total', () => {
  const totals = cartTotals([{ id: 'a', quantity: 1 }], products);
  assert.equal(totals.subtotal, 399);
  assert.equal(totals.delivery, 49);
  assert.equal(totals.total, 448);
  assert.equal(totals.savings, 251);
});
test('delivery becomes free at exactly ₹799', () => {
  const totals = cartTotals([{ id: 'a', quantity: 1 }, { id: 'b', quantity: 1 }], products);
  assert.equal(totals.count, 2);
  assert.equal(totals.subtotal, 799);
  assert.equal(totals.delivery, 0);
  assert.equal(totals.total, 799);
});
test('repeated additions merge and respect the quantity limit', () => {
  assert.deepEqual(normalizeCart([{ id: 'a', quantity: 4 }, { id: 'a', quantity: 9 }], products), [{ id: 'a', quantity: MAX_QUANTITY }]);
});
test('corrupt persisted data and consultation products cannot enter the bag', () => {
  assert.deepEqual(normalizeCart({ id: 'a' }, products), []);
  assert.deepEqual(normalizeCart([null, { id: 'unknown', quantity: 1 }, { id: 'consult', quantity: 1 }, { id: 'a', quantity: Infinity }, { id: 'a', quantity: -2 }], products), []);
});
test('decreasing to zero removes the line and recalculates delivery', () => {
  const cart = [{ id: 'a', quantity: 2 }, { id: 'b', quantity: 1 }];
  const reduced = normalizeCart(cart.map(line => line.id === 'a' ? { ...line, quantity: 0 } : line), products);
  const totals = cartTotals(reduced, products);
  assert.deepEqual(reduced, [{ id: 'b', quantity: 1 }]);
  assert.equal(totals.total, 449);
});
