import { STORE_CATEGORIES, STORE_PRODUCTS } from '../data/storefrontProducts.js';

export const STORE_CATALOG_KEY = 'nayacura_store_products_v1';
export const STORE_CATALOG_EVENT = 'nayacura:store-catalog';
export const DEFAULT_STORE_GROUPS = STORE_CATEGORIES.filter((item) => item !== 'All products');

const hasWindow = () => typeof window !== 'undefined';

function computeDiscountLabel(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return '';
  const pct = Math.round((1 - price / originalPrice) * 100);
  return pct > 0 ? `${pct}% OFF` : '';
}

export function normalizeStoreProduct(raw, fallbackId) {
  if (!raw || typeof raw !== 'object') return null;

  const title = String(raw.title || raw.name || '').trim();
  if (!title) return null;

  const price = Math.max(1, Math.round(Number(raw.price) || 0));
  const parsedOriginal = Math.round(Number(raw.originalPrice) || 0);
  const originalPrice = parsedOriginal >= price ? parsedOriginal : price;
  const group = String(raw.group || raw.category || DEFAULT_STORE_GROUPS[0]).trim() || DEFAULT_STORE_GROUPS[0];
  const packageInfo = String(raw.packageInfo || raw.size || '').trim();
  const desc = String(raw.desc || raw.copy || '').trim();
  const image = String(raw.image || '').trim();
  const id = String(raw.id || fallbackId || `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`).trim();

  return {
    id,
    name: String(raw.name || title).trim(),
    title,
    group,
    category: String(raw.category || group).trim(),
    price,
    originalPrice,
    discount: computeDiscountLabel(price, originalPrice),
    packageInfo,
    size: String(raw.size || packageInfo).trim(),
    desc,
    copy: String(raw.copy || desc).trim(),
    image,
    consult: Boolean(raw.consult),
    discreetPack: raw.discreetPack !== false,
    kind: raw.kind || 'box',
    color: raw.color || '#0B3B82',
    background: raw.background || '#EDF3FC',
    label: String(raw.label || group).toUpperCase(),
    createdAt: raw.createdAt || null,
  };
}

function defaultCatalog() {
  return STORE_PRODUCTS.map((product) => normalizeStoreProduct(product, product.id)).filter(Boolean);
}

function saveCatalog(products) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(STORE_CATALOG_KEY, JSON.stringify(products));
  } catch (error) {
    throw new Error('Browser storage is full. Try a smaller product image or an image URL.', { cause: error });
  }
  window.dispatchEvent(new Event(STORE_CATALOG_EVENT));
}

export function listStoreProducts() {
  const defaults = defaultCatalog();
  if (!hasWindow()) return defaults;
  try {
    const raw = window.localStorage.getItem(STORE_CATALOG_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults;
    const normalized = parsed.map((item) => normalizeStoreProduct(item)).filter(Boolean);
    return normalized.length ? normalized : defaults;
  } catch {
    return defaults;
  }
}

export function getStoreCategories(products = listStoreProducts()) {
  const seen = new Set(DEFAULT_STORE_GROUPS);
  const extras = [];
  for (const product of products) {
    if (product?.group && !seen.has(product.group)) {
      seen.add(product.group);
      extras.push(product.group);
    }
  }
  return ['All products', ...DEFAULT_STORE_GROUPS, ...extras];
}

export function addStoreProduct(input) {
  const normalized = normalizeStoreProduct({
    ...input,
    id: input?.id || `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  });
  if (!normalized) {
    throw new Error('Product title is required.');
  }
  const next = [normalized, ...listStoreProducts()];
  saveCatalog(next);
  return normalized;
}

export function updateStoreProduct(id, patch) {
  const current = listStoreProducts();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('Product not found.');
  }
  const merged = normalizeStoreProduct({ ...current[index], ...patch, id });
  if (!merged) {
    throw new Error('Product title is required.');
  }
  const next = current.map((item) => (item.id === id ? merged : item));
  saveCatalog(next);
  return merged;
}

export function deleteStoreProduct(id) {
  const current = listStoreProducts();
  const next = current.filter((item) => item.id !== id);
  saveCatalog(next);
  return next;
}

export function resetStoreCatalog() {
  const defaults = defaultCatalog();
  saveCatalog(defaults);
  return defaults;
}

export function subscribeStoreCatalog(callback) {
  if (!hasWindow()) return () => {};
  const onUpdate = () => callback(listStoreProducts());
  const onStorage = (event) => {
    if (!event.key || event.key === STORE_CATALOG_KEY) {
      onUpdate();
    }
  };
  window.addEventListener(STORE_CATALOG_EVENT, onUpdate);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(STORE_CATALOG_EVENT, onUpdate);
    window.removeEventListener('storage', onStorage);
  };
}

export async function compressProductImage(file, maxDimension = 720) {
  if (!file) throw new Error('Please choose an image file.');
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (PNG, JPG, WebP) are supported.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be smaller than 10 MB.');
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const imageEl = new Image();
    imageEl.onload = () => resolve(imageEl);
    imageEl.onerror = () => reject(new Error('Could not decode the selected image.'));
    imageEl.src = dataUrl;
  });

  const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/webp', 0.85);
}
