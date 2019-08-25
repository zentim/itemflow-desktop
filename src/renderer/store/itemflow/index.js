import {
  storageSetDataPath,
  storageHas,
  storageGet,
  storageGetAll,
  storageSet,
  storageClear,
  storageRemove
} from '../../helper/storageHelper'
const storage = require('electron-json-storage')
const fuzzysort = require('fuzzysort')

export default {
  state: {
    itemflowStore: [],
    searchResults: [],
    searchKeyword: '',
    rightDrawerItemflow: []
  },
  getters: {
    // [about vuex alert: Do not mutate vuex store state outside mutation handlers.]
    // (http://www.cnblogs.com/vali/p/7825628.html)
    itemflowStore (state) {
      return state.itemflowStore
    },
    itemflowStoreByAmount (state) {
      return amount => {
        return state.itemflowStore.slice(0, amount)
      }
    },
    itemflowStoreObj (state) {
      return ObjId => {
        // 回傳第一個滿足所提供之測試函式的元素值，否則回傳 undefined
        let targetObj = state.itemflowStore.find(obj => {
          return obj.id === ObjId
        })
        if (targetObj === undefined) {
          console.log(
            'Getters Alert: can not find ' + ObjId + ', return undefined'
          )
        }
        return targetObj
      }
    },
    favoriteItemflow (state) {
      return state.itemflowStore.filter(obj => obj.favorite === true)
    },
    deletedItemflow (state) {
      return state.itemflowStore.filter(obj => !!obj.deletedDate)
    },
    searchResults (state) {
      return state.searchResults
    },
    searchKeyword (state) {
      return state.searchKeyword
    },
    rightDrawerItemflow (state) {
      return state.rightDrawerItemflow
    }
  },
  mutations: {
    setItemflowStore (state, payload) {
      state.itemflowStore = payload
    },
    setSearchResults (state, payload) {
      state.searchResults = payload
    },
    removeItemflowObj (state, payload) {
      // arrIndex return -1 is meaning checkId does not exist in arr
      let arr = state.itemflowStore
      let checkId = payload.id
      let arrIndex = arr
        .map((item, index) => {
          return item.id
        })
        .indexOf(checkId)

      // remove exist target
      if (arrIndex !== -1) {
        state.itemflowStore.splice(arrIndex, 1)
        console.log('remove: ' + checkId)
      }
    },
    unshiftItemflowObj (state, payload) {
      state.itemflowStore.unshift(payload)
      console.log('add: ' + payload.id)
    },
    updateItemflowObj (state, payload) {
      // arrIndex return -1 is meaning checkId does not exist in arr
      let arr = state.itemflowStore
      let checkId = payload.id
      let arrIndex = arr
        .map((item, index) => {
          return item.id
        })
        .indexOf(checkId)

      // update exist target info
      if (arrIndex !== -1) {
        state.itemflowStore[arrIndex] = payload
        console.log('update: ' + payload.id)
      } else if (arrIndex === -1) {
        console.log(
          'Store updateItemflowObj Alert: target not exist in state.itemflowStore'
        )
      }
    },
    updateItemflowObjForImport (state, payload) {
      // arrIndex return -1 is meaning checkId does not exist in arr
      let arr = state.itemflowStore
      let checkId = payload.id
      let arrIndex = arr
        .map((item, index) => {
          return item.id
        })
        .indexOf(checkId)

      // remove exist target
      if (arrIndex !== -1) {
        state.itemflowStore[arrIndex] = payload
        console.log('update: ' + payload.id)
      } else if (arrIndex === -1) {
        state.itemflowStore.unshift(payload)
        console.log(
          'Store updateItemflowObjForImport Alert: target not exist in state.itemflowStore'
        )
        console.log('create: ' + payload.id)
      }
    },
    sortItemflowStore (state) {
      console.log('=== Start sorting... ===')
      let start = Date.now()
      state.itemflowStore.sort(function (a, b) {
        if (a.editedDate < b.editedDate) {
          return 1
        }
        if (a.editedDate > b.editedDate) {
          return -1
        }
        return 0
      })
      let end = Date.now()
      console.log('=== End sort... (' + (end - start) + ' ms) ===')
    },
    setSearchKeyword (state, payload) {
      state.searchKeyword = payload
    }
  },
  actions: {
    async loadItemflow ({ commit, getters, dispatch }) {
      console.log('!!! loadItemflow !!!')
      commit('setLoading', true)
      let tempItemflowStore = []
      // 1. check indexData.json :
      //    if doesn't have this file then do nothing.
      //    if has this file then import the index data into tempItemflowStore.
      storageSetDataPath()
      let hasIndexDataFile = await storageHas('indexData')
      if (hasIndexDataFile) {
        let indexDataFile = await storageGet('indexData')
        tempItemflowStore = indexDataFile.indexData
      }

      // 2. check file in the temp dir :
      //    if it's empty then do nothing.
      //    if it has any file then updates file (or files) into tempItemflowStore and save to data dir:
      //        only update itemflow's metadata into tempItemflowStore.
      //        save it into data dir.
      storageSetDataPath('/temp')
      let tempDir = await storageGetAll()
      let keyset = Object.keys(tempDir)
      for (let index in keyset) {
        let keyname = keyset[index]
        let formatObj = _itemflowStructureObj(tempDir[keyname])
        let metaObj = {
          id: formatObj.id,
          type: formatObj.type,
          title: formatObj.title,
          message: formatObj.message,
          createdDate: formatObj.createdDate,
          editedDate: formatObj.editedDate,
          deletedDate: formatObj.deletedDate,
          favorite: formatObj.favorite,
          clickRate: formatObj.clickRate
        }
        // arrIndex return -1 is meaning checkId does not exist in arr
        let arr = tempItemflowStore
        let checkId = keyname
        let arrIndex = arr
          .map((item, index) => {
            return item.id
          })
          .indexOf(checkId)

        // only update itemflow's metadata into tempItemflowStore
        if (arrIndex !== -1) {
          // old itemflow
          console.log('update: ' + formatObj.id)
          tempItemflowStore[arrIndex] = metaObj
        } else if (arrIndex === -1) {
          // new itemflow
          console.log('add: ' + formatObj.id)
          tempItemflowStore.push(metaObj)
        }
        // save into data dir
        storageSetDataPath('/data')
        await storageSet(formatObj.id, formatObj)
      }
      // after update, clear temp dir
      storageSetDataPath('/temp')
      await storageClear()

      // 3. set the value of itemflowStore with tempItemflowStore
      commit('setItemflowStore', tempItemflowStore)

      // 4. to sort itemflowStore
      commit('sortItemflowStore')

      // 5. save itemflowStore as indexData.json
      dispatch('outputItemflowStore')
      commit('setLoading', false)
    },
    async outputItemflowStore ({ getters }) {
      let indexData = getters.itemflowStore.slice()
      storageSetDataPath()
      await storageSet('indexData', { indexData })
    },
    async updateItemflow ({ commit, getters, dispatch }, payload) {
      let obj = _itemflowAllDataObj(payload)

      if (payload.createdDate) {
        // exist, update it
        obj.editedDate = new Date().toISOString()
        if (!payload.deletedDate) {
          obj.clickRate = obj.clickRate + 1
        }

        // update itemflowStore
        commit('updateItemflowObj', _itemflowMetaDataObj(obj))
      } else {
        // not exist, create it
        commit('unshiftItemflowObj', _itemflowMetaDataObj(obj)) // add new one
      }

      commit('sortItemflowStore')
      storageSetDataPath('/temp')
      await storageSet(obj.id, obj)
      console.log(`updateItemflow: storage save '${obj.id}' success!`)
    },
    async removeItemflow ({ commit, getters }, payload) {
      // remove from itemflowStore
      commit('removeItemflowObj', payload)
      let removedObjId = payload.id

      // remove from /temp
      storageSetDataPath('/temp')
      let hasKey = await storageHas(removedObjId)
      if (hasKey) {
        storageSetDataPath('/temp')
        await storageRemove(removedObjId)
      }
      // remove from /data
      storageSetDataPath('/data')
      hasKey = await storageHas(removedObjId)
      if (hasKey) {
        storageSetDataPath('/temp')
        await storageRemove(removedObjId)
      }
    },
    addObjToTargetsFrom (
      { commit, getters },
      { obj, targetsName, targetsFromName }
    ) {
      // get targets, is an empty array will end this function
      let targets = obj[targetsName]
      if (targets.length === 0) {
        return
      }

      // prepare update data
      let cardData = {
        id: obj.id,
        type: obj.type,
        title: obj.title,
        message: obj.message
      }

      // process add the card data into targetsFrom of targets
      targets.forEach(target => {
        // skip if the target id is undefined
        if (target.id === undefined) {
          return
        }

        // skip if the targetObj does not exist
        // [關於 JS 中的淺拷貝和深拷貝](http://larry850806.github.io/2016/09/20/shallow-vs-deep-copy/)
        let targetObj = getters.itemflowStoreObj(target.id)
        targetObj = JSON.parse(JSON.stringify(targetObj))
        targetObj = _itemflowStructureObj(targetObj)
        if (Object.getOwnPropertyNames(targetObj).length === 0) {
          return
        }

        // check for duplicates
        // arrIndex return -1 is meaning checkId does not exist in arr
        let arr = targetObj[targetsFromName]
        let checkId = cardData.id
        let arrIndex = arr
          .map((item, index) => {
            return item.id
          })
          .indexOf(checkId)

        // does not exist in targetsFrom will push into
        if (arrIndex === -1) {
          targetObj[targetsFromName].push(cardData)
        }

        // update targetObj into itemflowStore
        commit('updateItemflowObj', targetObj)
      })
    },
    searchItemFlow ({ commit, getters }) {
      let keyword = getters.searchKeyword
      if (!keyword) {
        commit('setSearching', false)
        return
      }
      commit('setSearching', true)

      // [fuzzysort](https://github.com/farzher/fuzzysort)
      // Fast SublimeText-like fuzzy search for JavaScript.
      let dataset = getters.itemflowStore.filter(obj => !obj.deletedDate)
      let result = fuzzysort.go(keyword, dataset, {
        keys: ['title', 'message']
      })
      console.log(result)
      let totallyMatch = []
      let searchResults = []
      let resultLength = result ? result.length : 0

      for (let i = 0; i < resultLength; i++) {
        if (result[i].score === 0) {
          totallyMatch.push(result[i].obj)
        } else {
          searchResults.push(result[i].obj)
          if (result[i].score > -50) {
            searchResults.sort(function (a, b) {
              if (a.clickRate < b.clickRate) {
                return 1
              }
              if (a.clickRate > b.clickRate) {
                return -1
              }
              return 0
            })
          }
        }
      }
      for (let i = 0; i < totallyMatch.length; i++) {
        searchResults.unshift(totallyMatch[i])
      }
      commit('setSearchResults', searchResults)
    },
    async exportData ({ commit, getters }) {
      console.log('TODO: rewrite export data function!')
      // storageSetDataPath('/data')
      // let all = await storageKeys()
      // for (let i = 0; i < all.length; i++) {
      //   storageSetDataPath('/data')
      //   let one = await storageGet(all[i])
      //   let afterdata = _processObj(one)

      //   storageSetDataPath('/data3')
      //   await storageSet(afterdata.id, afterdata)
      //   console.log(afterdata.id)
      // }

      // console.log('==== process finished ====')

      // let exportdata = getters.itemflowStore.slice()
      // let dataset = {}
      // let count = 0
      // exportdata.forEach(element => {
      //   if (count < 600) {
      //     count++
      //     dataset[element.id] = element
      //   } else {
      //     // output file
      //     let jsonData = JSON.stringify(dataset)
      //     let a = document.createElement('a')
      //     let file = new Blob([jsonData], { type: 'text/plain' })
      //     a.href = URL.createObjectURL(file)
      //     a.download = 'itemflow_' + Date.now() + '.json'
      //     a.click()

      //     // reset
      //     dataset = {}
      //     count = 0
      //   }
      // })

      // // output file
      // let jsonData = JSON.stringify(dataset)
      // let a = document.createElement('a')
      // let file = new Blob([jsonData], { type: 'text/plain' })
      // a.href = URL.createObjectURL(file)
      // a.download = 'itemflow_' + Date.now() + '.json'
      // a.click()
    },
    exportSelectedData ({ commit, getters }, payload) {
      let exportSelectedData = payload
      let dataset = []
      let count = 0
      exportSelectedData.forEach(element => {
        if (count < 600) {
          count++
          dataset.push(getters.itemflowStoreObj(element))
        } else {
          // output file
          let jsonData = JSON.stringify(dataset)
          let a = document.createElement('a')
          let file = new Blob([jsonData], { type: 'text/plain' })
          a.href = URL.createObjectURL(file)
          a.download = 'itemflow_' + Date.now() + '.json'
          a.click()

          // reset
          dataset = []
          count = 0
        }
      })

      // output file
      let jsonData = JSON.stringify(dataset)
      let a = document.createElement('a')
      let file = new Blob([jsonData], { type: 'text/plain' })
      a.href = URL.createObjectURL(file)
      a.download = 'itemflow_' + Date.now() + '.json'
      a.click()
    },
    importData ({ commit, getters, dispatch }, payload) {
      commit('setImporting', true)
      let dataset = payload

      if (typeof dataset !== 'object' || dataset === null) {
        let error = 'Error: is not object or is null'
        dispatch('clearError')
        dispatch('setErrorText', error)
        return
      }

      for (let key in dataset) {
        let data = {
          id: key,
          ...dataset[key]
        }
        commit('updateItemflowObjForImport', _itemflowStructureObj(data))
      }

      commit('sortItemflowStore')

      // output
      // format output structure
      let data = {}
      getters.itemflowStore.slice().forEach(element => {
        data[element.id] = element
      })

      // output
      storage.set('itemflowStore', data, error => {
        if (error) throw error
        console.log('outputItemflowStore store success!')
      })

      commit('setImporting', false)
    }
  }
}

// [如何用 JavaScript 產生 UUID / GUID？](https://cythilya.github.io/2017/03/12/uuid/)
// Return: String
function _uuid () {
  let d = Date.now()
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now() // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// create data structure for itemflow
// Return: Object
function _itemflowStructureObj (payload) {
  let obj = {
    id: payload.id ? payload.id : _uuid(),
    type: payload.type ? payload.type : 'item',
    title: payload.title ? payload.title : '',
    message: payload.message ? payload.message : '',
    labels: Array.isArray(payload.labels) ? payload.labels : [],
    labelsFrom: Array.isArray(payload.labelsFrom) ? payload.labelsFrom : [],
    whoOwnMe: Array.isArray(payload.whoOwnMe) ? payload.whoOwnMe : [],
    createdDate: payload.createdDate
      ? payload.createdDate
      : new Date().toISOString(),
    editedDate: payload.editedDate
      ? payload.editedDate
      : new Date().toISOString(),
    deletedDate: payload.deletedDate ? payload.deletedDate : '',
    favorite: payload.favorite ? payload.favorite : false,
    clickRate: payload.clickRate ? payload.clickRate : 0,
    itemContent: payload.itemContent ? payload.itemContent : '',
    flowContent: Array.isArray(payload.flowContent) ? payload.flowContent : []
  }
  return obj
}

function _itemflowMetaDataObj (payload) {
  let obj = {
    id: payload.id ? payload.id : _uuid(),
    type: payload.type ? payload.type : 'item',
    title: payload.title ? payload.title : '',
    message: payload.message ? payload.message : '',
    createdDate: payload.createdDate
      ? payload.createdDate
      : new Date().toISOString(),
    editedDate: payload.editedDate
      ? payload.editedDate
      : new Date().toISOString(),
    deletedDate: payload.deletedDate ? payload.deletedDate : '',
    favorite: payload.favorite ? payload.favorite : false,
    clickRate: payload.clickRate ? payload.clickRate : 0
  }

  return obj
}

function _itemflowAllDataObj (payload) {
  let obj = {
    id: payload.id ? payload.id : _uuid(),
    type: payload.type ? payload.type : 'item',
    title: payload.title ? payload.title : '',
    message: payload.message ? payload.message : '',
    labels: Array.isArray(payload.labels) ? payload.labels : [],
    labelsFrom: Array.isArray(payload.labelsFrom) ? payload.labelsFrom : [],
    whoOwnMe: Array.isArray(payload.whoOwnMe) ? payload.whoOwnMe : [],
    createdDate: payload.createdDate
      ? payload.createdDate
      : new Date().toISOString(),
    editedDate: payload.editedDate
      ? payload.editedDate
      : new Date().toISOString(),
    deletedDate: payload.deletedDate ? payload.deletedDate : '',
    favorite: payload.favorite ? payload.favorite : false,
    clickRate: payload.clickRate ? payload.clickRate : 0,
    itemContent: payload.itemContent ? payload.itemContent : '',
    flowContent: Array.isArray(payload.flowContent) ? payload.flowContent : []
  }

  if (obj.flowContent.length) {
    let arr = []
    obj.flowContent.forEach(d => {
      arr.push(d.id)
    })
    obj.flowContent = arr
  }

  if (obj.whoOwnMe.length) {
    let arr = []
    obj.whoOwnMe.forEach(d => {
      arr.push(d.id)
    })
    obj.whoOwnMe = arr
  }

  if (obj.labels.length) {
    let arr = []
    obj.labels.forEach(d => {
      arr.push(d.id)
    })
    obj.labels = arr
  }

  if (obj.labelsFrom.length) {
    let arr = []
    obj.labelsFrom.forEach(d => {
      arr.push(d.id)
    })
    obj.labelsFrom = arr
  }

  return obj
}
