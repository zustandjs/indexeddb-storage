export function openDatabase(
  databaseName: string,
  storeName: string,
): Promise<IDBDatabase> {
  const openRequest = indexedDB.open(databaseName, 1)

  openRequest.addEventListener(
    'upgradeneeded',
    (event) => {
      if (event.target instanceof IDBOpenDBRequest) {
        const database = event.target.result

        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName)
        }
      }
    },
    { once: true },
  )

  return promisifyRequest(openRequest)
}

export function promisifyRequest<T = undefined>(
  request: IDBRequest<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
