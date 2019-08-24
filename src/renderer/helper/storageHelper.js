const storage = require('electron-json-storage')

/**
 * electron-json-storage with promise
 * [Easily write and read user settings in Electron apps](https://github.com/electron-userland/electron-json-storage)
 * [Promise support?](https://github.com/electron-userland/electron-json-storage/issues/73#issuecomment-470194849)
 */

function storageSetDataPath (path = '/') {
  let absPath = storage.getDefaultDataPath() + path
  storage.setDataPath(absPath)
  return absPath
}

function storageGet (key) {
  return new Promise((resolve, reject) => {
    storage.get(key, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

function storageGetMany (keyArray) {
  return new Promise((resolve, reject) => {
    storage.getMany(keyArray, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

function storageGetAll () {
  return new Promise((resolve, reject) => {
    storage.getAll((err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

function storageSet (key, json) {
  return new Promise((resolve, reject) => {
    storage.set(key, json, err => {
      if (err) reject(err)
      resolve('save success')
    })
  })
}

function storageHas (key) {
  return new Promise((resolve, reject) => {
    storage.has(key, (err, hasKey) => {
      if (err) reject(err)
      resolve(hasKey)
    })
  })
}

function storageKeys () {
  return new Promise((resolve, reject) => {
    storage.keys((err, keys) => {
      if (err) reject(err)
      resolve(keys)
    })
  })
}

function storageRemove (key) {
  return new Promise((resolve, reject) => {
    storage.remove(key, err => {
      if (err) reject(err)
      resolve('remove success')
    })
  })
}

function storageClear () {
  return new Promise((resolve, reject) => {
    storage.clear(err => {
      if (err) reject(err)
      resolve('clear success')
    })
  })
}

export {
  storageSetDataPath,
  storageGet,
  storageGetMany,
  storageGetAll,
  storageSet,
  storageHas,
  storageKeys,
  storageRemove,
  storageClear
}
