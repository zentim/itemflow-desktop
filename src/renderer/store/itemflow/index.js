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
        let itemflowstoreobj = state.itemflowStore.find(obj => {
          return obj.id === ObjId
        })
        return Object.assign({}, itemflowstoreobj)
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
      // indexOf return -1 is meaning target not existed
      let objIndex = state.itemflowStore.map((item, index) => {
        return item.id
      }).indexOf(payload)
      // remove existed target
      if (objIndex !== -1) {
        state.itemflowStore.splice(objIndex, 1)
      }
    },
    addItemflowObj (state, payload) {
      state.itemflowStore.push(payload)
    }
  },
  actions: {
    loadItemflow ({ commit, getters }) {
      commit('setLoading', true)
      // [Easily write and read user settings in Electron apps]
      // (https://github.com/electron-userland/electron-json-storage#module_storage.getDefaultDataPath)
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
            commit('setLoading', false)
          })
        } else {
          // output
          storage.set('itemflowStore', {}, error => {
            if (error) throw error

            console.log('creaet itemflowStore.json')
            commit('setLoading', false)
          })
        }
      })
    },
    updateItemflow ({ commit, getters, dispatch }, payload) {
      let obj = _itemflowStructureObj(payload)

      if (payload.createdDate) {
        // existed, update it
        obj.editedDate = new Date().toISOString()
        obj.clickRate = (obj.clickRate + 1)
        commit('removeItemflowObj', obj.id) // remove old one
        commit('addItemflowObj', obj) // add new one
      } else {
        // not existed, create it
        commit('addItemflowObj', obj) // add new one
      }

      // process labels and labelsFrom
      dispatch('addLabelsFrom', {
        targets: obj.labels,
        updatedData: {
          id: obj.id,
          type: obj.type,
          title: obj.title,
          message: obj.message
        }
      })
      // process whoOwnMe
      dispatch('addWhoOwnMe', {
        targets: obj.flowContent,
        updatedData: {
          id: obj.id,
          type: obj.type,
          title: obj.title,
          message: obj.message
        }
      })

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
    removeItemflow ({ commit, getters }, payload) {
      const objId = payload.id
      commit('removeItemflowObj', objId)
    },
    addLabelsFrom ({ commit, getters }, payload) {
      // 需要有保護措施，先獲得那些要被改的對象，檢查是否有我，有的話跳過，沒有的話就加入
      // payload = {
      //   targets: [{}, {}],
      //   updatedData: {
      //     id: '',
      //     type: '',
      //     title: '',
      //     message: ''
      //   }
      // }

      let targets = payload.targets

      if (!targets.id || !targets.length) {
        console.log('addLabelsFrom: nothing to add')
        return
      }

      let updatedData = payload.updatedData

      let i = 0
      let len = targets ? targets.length : 0
      for (i = 0; i < len; i++) {
        let target = getters.itemflowStoreObj(targets[i].id)
        if (!target) {
          console.log(
            'addLabelsFrom alert: target (' + targets[i].id + ') is not existed'
          )
          continue
        }

        let targetLabelsFrom = target.labelsFrom
        let j = 0
        let isExisted = false
        let targetLabelsFromLen = targetLabelsFrom ? targetLabelsFrom.length : 0
        for (j = 0; j < targetLabelsFromLen; j++) {
          if (targetLabelsFrom[j].id === updatedData.id) {
            console.log(
              'addLabelsFrom alert: updatedData is already existed targetLabelsFrom'
            )
            isExisted = true
            break
          }
        }

        if (!isExisted) {
          targetLabelsFrom = [...targetLabelsFrom, updatedData]
          console.log(target.title + ': addLabelsFrom successd')
        }

        target.labelsFrom = targetLabelsFrom
        // output
        storage.set(target.id, target, error => {
          if (error) throw error
        })
      }
    },
    addWhoOwnMe ({ commit, getters, dispatch }, payload) {
      // 需要有保護措施，先獲得那些要被改的對象，檢查是否有我，有的話跳過，沒有的話就加入
      // payload = {
      //   targets: [{}, {}],
      //   updatedData: {
      //     id: '',
      //     type: '',
      //     title: '',
      //     message: ''
      //   }
      // }
      let targets = payload.targets

      if (!targets.id || !targets.length) {
        console.log('addLabelsFrom: nothing to add')
        return
      }

      let updatedData = payload.updatedData
      let i = 0
      let len = targets ? targets.length : 0
      for (i = 0; i < len; i++) {
        let target = getters.itemflowStoreObj(targets[i].id)
        if (!target) {
          console.log(
            'addWhoOwnMe alert: target (' + targets[i].id + ') is not existed'
          )
          continue
        }
        let targetWhoOwnMe = target.whoOwnMe || []
        let j = 0
        let isExisted = false
        let targetWhoOwnMeLen = targetWhoOwnMe ? targetWhoOwnMe.length : 0
        for (j = 0; j < targetWhoOwnMeLen; j++) {
          if (targetWhoOwnMe[j].id === updatedData.id) {
            console.log(
              'addWhoOwnMe alert: updatedData is already existed targetWhoOwnMe'
            )
            isExisted = true
            break
          }
        }
        if (!isExisted) {
          targetWhoOwnMe = [...targetWhoOwnMe, updatedData]
          console.log(target.title + ': addWhoOwnMe successd')
        }
        target.whoOwnMe = targetWhoOwnMe
        // output
        storage.set(target.id, target, error => {
          if (error) throw error
        })
      }
    },
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
          'removeLabelsFrom alert: target(' + payload.id + ') not existed'
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
          'removeWhoOwnMe alert: target(' + payload.id + ') not existed'
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

      let output = {}
      getters.itemflowStore.forEach(element => {
        output[element.id] = element
      })
      // output
      // output
      storage.set('itemflowStore', output, error => {
        if (error) throw error

        commit('setImporting', false)
      })
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
    labels: payload.labels ? payload.labels : [],
    labelsFrom: payload.labelsFrom ? payload.labelsFrom : [],
    whoOwnMe: payload.whoOwnMe ? payload.whoOwnMe : [],
    createdDate: payload.createdDate ? payload.createdDate : new Date().toISOString(),
    editedDate: payload.editedDate ? payload.editedDate : new Date().toISOString(),
    deletedDate: payload.deletedDate ? payload.deletedDate : '',
    favorite: payload.favorite ? payload.favorite : false,
    clickRate: payload.clickRate ? payload.clickRate : 0,
    itemContent: payload.itemContent ? payload.itemContent : '',
    flowContent: payload.flowContent ? payload.flowContent : []
  }
  return obj
}
