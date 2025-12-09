# `zustand-indexeddb`

Persist Zustand stores in IndexedDB.

## Motivation

I like Zustand. I also like storing non-serializable data in my state (think `FileSystemFileHandle` or any other non-serializable objects). It so happened that IndexedDB is one of the few storages that is able to persist such data. I built this package to make it easier to create and manage Zustand stores with non-serializable data.

## Usage

```sh
npm i zustand zustand-indexeddb
```

This package is meant to be used in combination with the `persist()` middleware.

```ts
import { createStore } from 'zustand'
import { persist } from 'zustand/middleware'
import { createIndexedDBStorage } from 'zustand-indexeddb'

const userStore = createStore(
  persist(() => initialUserState, {
    name: 'user',
    version: 0.1,
    storage: createIndexedDBStorage('my-app', 'refs')
  })
)
```

Since IndexedDB transactions are asynchronous, make sure to await any Zustand operations as well:

```ts
await userStore.setState(() => ({ name: 'John' }))
````

> Note: You don't have to await `.getState()` because it's _synchronous_ by design (the store asynchronously hydrates, then keeps its state in-memory, exposing you its latest values).

## API

### `createIndexedDBStorage(databaseName, storeName)`

- `databaseName` (`string`), the name of the IndexedDB database to open;
- `storeName` (`string`), the name of the IndexedDB store to create. Do not confuse it with Zustand's store—these have nothing to do with each other.

Calling this function returns an asynchronous Zustand storage that retrieves, writes, and deletes state in the respective IndexedDB database.

**The `name` option of your `persist()` middleware is used as the row name in the created store.** This allows you to persist multiple different Zustand stores within the same database+store compartment. This also means that each row has its own individual rehydration and migration logic, which is neat.

## FAQ

### Why not `idb-keyval`?

[`idb-keyval`](https://github.com/jakearchibald/idb-keyval) is a great library that simplifies working with IndexedDB. You can use it to implement your own custom storage, but there's one important limitation that `idb-keyval` has that prevented me from adopting that approach:

> _But `createStore` won't let you create multiple stores within the same database. Nor will it let you create a store within an existing database._
>
> —["Custom stores"](https://github.com/jakearchibald/idb-keyval/blob/9d19315b4a83897df1e0193dccdc29f78466a0f3/custom-stores.md)

This means you have to use unique databases for different Zustand stores, which I find unappealing.

### How do I combine it with `createJSONStorage`?

You don't. The whole purpose of storing your state in IndexedDB is to persist _non-serializable_ data. The kind that doesn't make sense to pass to `JSON.stringify()` because an empty string (or worse) will come out of it. If you can serialize your data, store it in any available web storage (`localStorage`, `sessionStorage`, etc).
