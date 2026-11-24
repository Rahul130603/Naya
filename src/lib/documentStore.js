const DB_NAME = 'nayacura_documents';
const DB_VERSION = 1;
const STORE = 'files';

const supported = () => typeof window !== 'undefined' && 'indexedDB' in window;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDocument(key, file) {
  if (!supported() || !file) return false;
  try {
    const database = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put(file, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
    return true;
  } catch {
    return false;
  }
}

export async function getDocument(key) {
  if (!supported()) return null;
  try {
    const database = await openDatabase();
    const blob = await new Promise((resolve, reject) => {
      const request = database.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return blob;
  } catch {
    return null;
  }
}

export async function deleteDocument(key) {
  if (!supported()) return;
  try {
    const database = await openDatabase();
    await new Promise((resolve) => {
      const transaction = database.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
    database.close();
  } catch {
    /* ignore */
  }
}
