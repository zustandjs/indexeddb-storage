import type { PersistStorage, StorageValue } from 'zustand/middleware/persist'
import { openDatabase, promisifyRequest } from './utils'

/**
 * Create a persist storage using `IndexedDB`.
 * Handy for persisting non-serializable data.
 * @param databaseName A name of the database.
 * @param storeName A name of the store within the database.
 *
 * @example
 * createStore(
 *   persist(initialState, {
 *     version: 0.1,
 *     name: 'row-key',
 *     storage: createIndexedDBStorage('database-name', 'store-name')
 *   })
 * )
 */
export function createIndexedDBStorage<S>(
  databaseName: string,
  storeName: string,
): PersistStorage<S, Promise<void>> {
  return {
    async getItem(name) {
      const database = await openDatabase(databaseName, storeName)
      const objectStore = database
        .transaction(storeName, 'readonly')
        .objectStore(storeName)

      return await promisifyRequest<StorageValue<S>>(objectStore.get(name))
    },

    async setItem(name, value) {
      const database = await openDatabase(databaseName, storeName)
      const objectStore = database
        .transaction(storeName, 'readwrite')
        .objectStore(storeName)

      await promisifyRequest(objectStore.put(value, name))
    },

    async removeItem(name) {
      const database = await openDatabase(databaseName, storeName)
      const objectStore = database
        .transaction(storeName, 'readwrite')
        .objectStore(storeName)

      await promisifyRequest(objectStore.delete(name))
    },
  }
}
