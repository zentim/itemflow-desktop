const storage = require('electron-json-storage')
const fuzzysort = require('fuzzysort')

export default {
  state: {
    itemflowStore: [],
    searchResults: []
  },
  getters: {
    // [about vuex alert: Do not mutate vuex store state outside mutation handlers.]
    // (http://www.cnblogs.com/vali/p/7825628.html)
    allItemflow (state) {
      let allitemflow = state.itemflowStore.slice()
      allitemflow.sort(function (a, b) {
        if (a.editedDate < b.editedDate) {
          return 1
        }
        if (a.editedDate > b.editedDate) {
          return -1
        }
        return 0
      })
      return allitemflow
    },
    itemflowStore (state, getters) {
      let itemflowstore = getters.allItemflow.filter(obj => !obj.deletedDate)
      return itemflowstore.slice()
    },
    itemflowStoreByAmount (state, getters) {
      return amount => {
        return getters.itemflowStore.slice(0, amount)
      }
    },
    itemflowStoreObj (state) {
      return ObjId => {
        // 回傳第一個滿足所提供之測試函式的元素值，否則回傳 undefined
        let itemflowstoreobj = state.itemflowStore.find(obj => {
          return obj.id === ObjId
        })

        // itemflowstoreobj is undefined, will return {}
        // note:
        // [關於 JS 中的淺拷貝和深拷貝]
        // (http://larry850806.github.io/2016/09/20/shallow-vs-deep-copy/)
        // Object.assign() 只能處理深度只有一層的物件沒辦法做到真正的 Deep Copy，
        // 不過如果要複製的物件只有一層的話可以考慮使用
        let target = Object.assign({}, itemflowstoreobj)
        if (Object.getOwnPropertyNames(target).length === 0) {
          console.log('Store Alert: itemflow target obj is empty!')
        }
        return target
      }
    },
    loadedItems (state, getters) {
      return getters.itemflowStore.filter(obj => obj.type === 'item')
    },
    loadedFlows (state, getters) {
      return getters.itemflowStore.filter(obj => obj.type === 'flow')
    },
    favoriteItemflow (state, getters) {
      return getters.itemflowStore.filter(obj => obj.favorite === true)
    },
    deletedItemflow (state, getters) {
      let itemflowstore = state.itemflowStore.slice()
      return itemflowstore.filter(obj => !!obj.deletedDate)
    },
    searchResults (getters) {
      return getters.searchResults
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
      let arrIndex = arr.map((item, index) => {
        return item.id
      }).indexOf(checkId)

      // remove exist target
      if (arrIndex !== -1) {
        state.itemflowStore.splice(arrIndex, 1)
        console.log('remove: ' + checkId)
      }
    },
    addItemflowObj (state, payload) {
      state.itemflowStore.push(payload)
      console.log('add: ' + payload.id)
    }
  },
  actions: {
    loadItemflow ({ commit, getters }) {
      commit('setLoading', true)
      // [Easily write and read user settings in Electron apps]
      // (https://github.com/electron-userland/electron-json-storage)
      storage.has('itemflowStore', (error, hasKey) => {
        if (error) throw error

        if (hasKey) {
          console.log('has itemflowStore.json')
          storage.get('itemflowStore', (error, data) => {
            if (error) throw error

            let newItemflowStore = []
            for (let key in data) {
              let payload = data[key]
              let obj = _itemflowStructureObj(payload)
              newItemflowStore.push(obj)
            }
            commit('setItemflowStore', newItemflowStore)
          })
        }
        commit('setLoading', false)
      })
    },
    outputItemflowStore ({ getters }) {
      // format output structure
      let data = {}
      getters.itemflowStore.forEach(element => {
        data[element.id] = element
      })

      // output
      storage.set('itemflowStore', data, error => {
        if (error) throw error
      })
    },
    updateItemflow ({ commit, getters, dispatch }, payload) {
      console.log('Store: updateItemflow')
      let obj = _itemflowStructureObj(payload)

      if (payload.createdDate) {
        // exist, update it
        obj.editedDate = new Date().toISOString()
        obj.clickRate = (obj.clickRate + 1)

        // update itemflowStore
        commit('removeItemflowObj', obj) // remove old one
        commit('addItemflowObj', obj) // add new one
      } else {
        // not exist, create it
        commit('addItemflowObj', obj) // add new one
      }

      // process add into labelsFrom
      dispatch('addObjToTargetsFrom', {
        obj: obj,
        targetsName: 'labels',
        targetsFromName: 'labelsFrom'
      })
      // process add into whoOwnMe
      dispatch('addObjToTargetsFrom', {
        obj: obj,
        targetsName: 'flowContent',
        targetsFromName: 'whoOwnMe'
      })

      // output
      dispatch('outputItemflowStore')
    },
    removeItemflow ({ commit, getters }, payload) {
      commit('removeItemflowObj', payload)
    },
    addObjToTargetsFrom ({ commit, getters }, { obj, targetsName, targetsFromName }) {
      // get targets, is an empty array will end this function
      let targets = obj[targetsName]
      console.log('161: ')
      console.log(targets)
      console.log('163:')
      console.log(targets.length)
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
      console.log('174: ')
      // process add the card data into targetsFrom of targets
      targets.forEach(target => {
        console.log('177: ')
        console.log(target)
        // skip if the target id is undefined
        if (!target.id) {
          return
        }

        // skip if the targetObj does not exist
        // [關於 JS 中的淺拷貝和深拷貝](http://larry850806.github.io/2016/09/20/shallow-vs-deep-copy/)
        let targetObj = JSON.parse(JSON.stringify(getters.itemflowStoreObj(target.id)))
        if (!targetObj) {
          return
        }
        console.log('193: targetObj does exist')
        console.log(targetObj)
        // You can push the card data into targetsFrom of targets directly，
        // because targetObj will check for duplicates during its load phase
        targetObj[targetsFromName].push(cardData)

        console.log('199:')
        // update targetObj into itemflowStore
        commit('removeItemflowObj', targetObj) // remove old one
        commit('addItemflowObj', targetObj) // add new one
        console.log(target.id + ' add successd')
        console.log(targetObj)
      })
    },
    // addToLabelsFrom ({ commit, getters }, payload) {
    //   // get targets, is an empty array will end this function
    //   let labels = payload.labels
    //   if (labels.length > 0) {
    //     console.log('addToLabelsFrom: labels array is empty')
    //     return
    //   }

    //   // prepare update data
    //   let cardData = {
    //     id: payload.id,
    //     type: payload.type,
    //     title: payload.title,
    //     message: payload.message
    //   }

    //   // process add the card data into labelsFrom of targets
    //   labels.forEach(label => {
    //     let target = getters.itemflowStoreObj(label.id)
    //     // Skip if the target does not exist
    //     if (!target) {
    //       return
    //     }

    //     // You can push the card data into labelsFrom of targets directly，
    //     // because target will check for duplicates during its load phase
    //     target.labelsFrom.push(cardData)

    //     // update itemflowStore
    //     commit('removeItemflowObj', target) // remove old one
    //     commit('addItemflowObj', target) // add new one
    //   })
    // },
    removeLabelsFrom ({ commit, getters }, payload) {
      // 需要有保護措施，先獲得那個要被改的對象，檢查是否有我，有的話移除，沒有的話就不用
      console.log('store action: removeLabelsFrom')
      // payload = {
      //   targetId: removedChip.id,
      //   removedObjId: this.$route.params.id
      // }

      let target = getters.itemflowStoreObj(payload.targetId)
      let removedObjId = payload.removedObjId
      if (!target) {
        console.log(
          'removeLabelsFrom alert: target(' + payload.id + ') does not exist'
        )
        return
      }
      if (!target.labelsFrom) {
        console.log('removeLabelsFrom alert: target labelsFrom is empty')
        return
      }
      let targetLabelsFrom = target.labelsFrom
      let i = 0
      let len = targetLabelsFrom.length
      for (i = 0; i < len; i++) {
        if (targetLabelsFrom[i].id === removedObjId) {
          let removedObj = targetLabelsFrom.splice(i, 1)
          console.log(removedObj)
          targetLabelsFrom = [...targetLabelsFrom]
          console.log(
            'remove successd: ' + removedObj[0].title + ' is removed'
          )
          console.log(targetLabelsFrom)
          break
        }
      }
      target.labelsFrom = targetLabelsFrom
      // output
      storage.set(target.id, target, error => {
        if (error) throw error
      })
    },
    removeWhoOwnMe ({ commit, getters }, payload) {
      // 需要有保護措施，先獲得那個要被改的對象，檢查是否有我，有的話移除，沒有的話就不用
      console.log('store action: removeWhoOwnMe')
      // payload = {
      //   targetId: removedChip.id,
      //   removedObjId: this.$route.params.id
      // }

      let target = getters.itemflowStoreObj(payload.targetId)
      let removedObjId = payload.removedObjId
      if (!target) {
        console.log(
          'removeWhoOwnMe alert: target(' + payload.id + ') does not exist'
        )
        return
      }
      if (!target.whoOwnMe) {
        console.log('removeWhoOwnMe alert: target whoOwnMe is empty')
        return
      }
      let targetWhoOwnMe = target.whoOwnMe
      let i = 0
      let len = targetWhoOwnMe.length
      for (i = 0; i < len; i++) {
        if (targetWhoOwnMe[i].id === removedObjId) {
          let removedObj = targetWhoOwnMe.splice(i, 1)
          console.log(removedObj)
          targetWhoOwnMe = [...targetWhoOwnMe]
          console.log(
            'remove successd: ' + removedObj[0].title + ' is removed'
          )
          console.log(targetWhoOwnMe)
          break
        }
      }
      target.whoOwnMe = targetWhoOwnMe
      // output
      storage.set(target.id, target, error => {
        if (error) throw error
      })
    },
    searchItemflow ({ commit, getters }, payload) {
      if (!payload) {
        commit('setSearching', false)
        return
      }
      commit('setSearching', true)

      // [fuzzysort](https://github.com/farzher/fuzzysort)
      // Fast SublimeText-like fuzzy search for JavaScript.
      let result = fuzzysort.go(payload, getters.itemflowStore, {
        keys: ['title', 'message']
      })

      let searchResults = []
      let resultLength = result ? result.length : 0
      for (let i = 0; i < resultLength; i++) {
        searchResults.push(result[i].obj)
      }
      console.log(searchResults)
      commit('setSearchResults', searchResults)
    },
    exportData ({ commit, getters }) {
      let exportdata = getters.allItemflow
      let data = {}
      exportdata.forEach(element => {
        data[element.id] = element
      })
      // output file
      var jsonData = JSON.stringify(data)
      var a = document.createElement('a')
      var file = new Blob([jsonData], {type: 'text/plain'})
      a.href = URL.createObjectURL(file)
      a.download = 'itemflow_' + Date.now() + '.json'
      a.click()
    },
    importData ({ commit, getters, dispatch }, payload) {
      commit('setImporting', true)
      let data = payload

      if ((typeof data !== 'object') || (data === null)) {
        let error = 'Error: is not object or is null'
        dispatch('clearError')
        dispatch('setErrorText', error)
        return
      }

      for (let key in data) {
        let payload = data[key]
        let obj = _itemflowStructureObj(payload)

        if (payload.createdDate) {
          commit('removeItemflowObj', obj.id)
          commit('addItemflowObj', obj)
        } else {
          commit('addItemflowObj', obj)
        }
      }

      // output
      dispatch('outputItemflowStore')

      commit('setImporting', false)
    }
  }
}

// [如何用 JavaScript 產生 UUID / GUID？](https://cythilya.github.io/2017/03/12/uuid/)
// Return: String
function _uuid () {
  var d = Date.now()
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now() // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// create data structure for itemflow
// Return: Ojbect
function _itemflowStructureObj (payload) {
  let obj = {
    id: payload.id ? payload.id : _uuid(),
    type: payload.type ? payload.type : 'item',
    title: payload.title ? payload.title : '',
    message: payload.message ? payload.message : '',
    labels: Array.isArray(payload.labels) ? payload.labels : [],
    labelsFrom: Array.isArray(payload.labelsFrom) ? payload.labelsFrom : [],
    whoOwnMe: Array.isArray(payload.whoOwnMe) ? payload.whoOwnMe : [],
    createdDate: payload.createdDate ? payload.createdDate : new Date().toISOString(),
    editedDate: payload.editedDate ? payload.editedDate : new Date().toISOString(),
    deletedDate: payload.deletedDate ? payload.deletedDate : '',
    favorite: payload.favorite ? payload.favorite : false,
    clickRate: payload.clickRate ? payload.clickRate : 0,
    itemContent: payload.itemContent ? payload.itemContent : '',
    flowContent: Array.isArray(payload.flowContent) ? payload.flowContent : []
  }
  return obj
}
