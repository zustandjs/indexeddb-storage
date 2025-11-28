import { it, expect } from 'vitest'
import { createStore, StoreApi } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'
import { createIndexedDBStorage } from '../src'
import { getRow } from './utils'

interface User {
  name: string
}

function untilHydrated(
  store: StoreApi<any> & {
    persist: { onFinishHydration(callback: () => void): void }
  },
): Promise<void> {
  return new Promise((resolve) => {
    store.persist.onFinishHydration(resolve)
  })
}

/**
 * @hote This is really how `persist` behaves but let's make sure.
 */
it('does not create the database on store initialization', async ({ task }) => {
  const store = createStore(
    persist<User>(() => ({ name: 'John' }), {
      name: task.id,
      version: 0.1,
      storage: createIndexedDBStorage('my-db', 'my-store'),
    }),
  )

  await untilHydrated(store)
  await expect(getRow('my-db', 'my-store', task.id)).resolves.toBeUndefined()
})

it('retrieves the initial state', async ({ task }) => {
  const store = createStore(
    persist<User>(() => ({ name: 'John' }), {
      name: task.id,
      version: 0.1,
      storage: createIndexedDBStorage('my-db', 'my-store'),
    }),
  )

  await untilHydrated(store)
  expect(store.getState()).toEqual({ name: 'John' })
})

it('persists store updates', async ({ task }) => {
  const store = createStore(
    persist<User>(() => ({ name: 'John' }), {
      name: task.id,
      version: 0.1,
      storage: createIndexedDBStorage('my-db', 'my-store'),
    }),
  )

  await untilHydrated(store)
  await store.setState(() => ({ name: 'Kaley' }))

  await expect(getRow('my-db', 'my-store', task.id)).resolves.toEqual({
    state: { name: 'Kaley' },
    version: 0.1,
  })
  expect(store.getState()).toEqual({ name: 'Kaley' })

  await store.setState(() => ({ name: 'Jason' }))
  await expect(getRow('my-db', 'my-store', task.id)).resolves.toEqual({
    state: { name: 'Jason' },
    version: 0.1,
  })
  expect(store.getState()).toEqual({ name: 'Jason' })
})

it('clears the persisted storage', async ({ task }) => {
  const store = createStore(
    persist<User>(() => ({ name: 'John' }), {
      name: task.id,
      version: 0.1,
      storage: createIndexedDBStorage('my-db', 'my-store'),
    }),
  )

  await untilHydrated(store)

  store.persist.clearStorage()
  await expect(getRow('my-db', 'my-store', task.id)).resolves.toBeUndefined()
})
