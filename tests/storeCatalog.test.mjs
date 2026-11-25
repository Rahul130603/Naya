import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addStoreProduct,
  deleteStoreProduct,
  getStoreCategories,
  listStoreProducts,
  normalizeStoreProduct,
  resetStoreCatalog,
  updateStoreProduct,
} from '../src/lib/storeCatalog.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear(),
  };
}

function installMockWindow() {
  const listeners = new Map();
  const storage = createMemoryStorage();
  globalThis.window = {
    localStorage: storage,
    addEventListener: (type, fn) => {
      const list = listeners.get(type) || [];
      listeners.set(type, [...list, fn]);
    },
    removeEventListener: (type, fn) => {
      const list = listeners.get(type) || [];
      listeners.set(type, list.filter((item) => item !== fn));
    },
    dispatchEvent: (event) => {
      const list = listeners.get(event.type) || [];
      for (const fn of list) fn(event);
    },
  };
  globalThis.Event = class MockEvent {
    constructor(type) {
      this.type = type;
    }
  };
}

test('storeCatalog seeds default products and supports add, update, delete, reset', () => {
  installMockWindow();

  const initial = listStoreProducts();
  assert.equal(initial.length, 6);

  const created = addStoreProduct({
    title: 'Vitality Zinc Complex',
    group: 'Couple Wellness',
    price: 599,
    originalPrice: 999,
    packageInfo: '60 Tablets',
    desc: 'Supports daily stamina and recovery.',
    image: 'data:image/webp;base64,ZmFrZQ==',
    consult: false,
  });

  assert.equal(created.discount, '40% OFF');
  assert.equal(listStoreProducts().length, 7);
  assert.equal(listStoreProducts()[0].title, 'Vitality Zinc Complex');
  assert.ok(getStoreCategories().includes('Couple Wellness'));

  const updated = updateStoreProduct(created.id, { price: 499, originalPrice: 999 });
  assert.equal(updated.discount, '50% OFF');

  deleteStoreProduct(created.id);
  assert.equal(listStoreProducts().length, 6);

  addStoreProduct({ title: 'Temp Item', price: 250, packageInfo: '10g', desc: 'Temp' });
  assert.equal(listStoreProducts().length, 7);
  resetStoreCatalog();
  assert.equal(listStoreProducts().length, 6);
});

test('normalizeStoreProduct rejects empty title and clamps originalPrice to price', () => {
  assert.equal(normalizeStoreProduct({ title: '   ', price: 100 }), null);
  const normalized = normalizeStoreProduct({
    title: 'Gentle Care Oil',
    price: 500,
    originalPrice: 300,
    packageInfo: '50 ml',
    desc: 'Soothing botanical blend.',
  });
  assert.equal(normalized.originalPrice, 500);
  assert.equal(normalized.discount, '');
});
