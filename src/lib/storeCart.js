export const CART_KEY = 'nayacura-wellness-cart-v1';
export const MAX_QUANTITY = 10;

export function normalizeCart(value, products) {
  if (!Array.isArray(value)) return [];
  const quantities = new Map();
  for (const line of value) {
    if (!line || !products.some(product => product.id === line.id && !product.consult)) continue;
    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    quantities.set(line.id, Math.min(MAX_QUANTITY, (quantities.get(line.id) || 0) + quantity));
  }
  return [...quantities].map(([id, quantity]) => ({ id, quantity }));
}

export function cartTotals(cart, products) {
  const lines = normalizeCart(cart, products).map(line => ({ ...line, product: products.find(product => product.id === line.id) }));
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const original = lines.reduce((sum, line) => sum + line.product.originalPrice * line.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 799 ? 0 : 49;
  return { lines, count: lines.reduce((sum, line) => sum + line.quantity, 0), subtotal, savings: original - subtotal, delivery, total: subtotal + delivery };
}
