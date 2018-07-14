const storage = require('electron-json-storage')
const fuzzysort = require('fuzzysort')

export default {
  state: {
    loadedItemflow: [],
    searchResults: []
  },
  getters: {
    allItemflow (state) {
      return state.loadedItemflow.filter(obj => !!obj.deletedDate === false)
    },
    loadedItemflow (state, getters) {
      return getters.allItemflow.sort(function (a, b) {
        if (a.editedDate < b.editedDate) {
          return 1
        }
        if (a.editedDate > b.editedDate) {
          return -1
        }
        return 0
      })
    },
    loadedItemflowObj (state) {
      return ObjId => {
        return state.loadedItemflow.find(obj => {
          return obj.id === ObjId
        })
      }
    },
    loadedItemflowByAmount (state, getters) {
      return amount => {
        return getters.loadedItemflow.slice(0, amount)
      }
    },
    loadedItems (state, getters) {
      return getters.loadedItemflow.filter(obj => obj.type === 'item')
    },
    loadedFlows (state, getters) {
      return getters.loadedItemflow.filter(obj => obj.type === 'flow')
    },
    favoriteItemflow (state, getters) {
      return getters.loadedItemflow.filter(obj => obj.favorite === true)
    },
    deletedItemflow (state, getters) {
      return state.loadedItemflow.filter(obj => !!obj.deletedDate === true)
    },
    searchResults (getters) {
      return getters.searchResults
    },
    searchResultsItems (state, getters) {
      return getters.searchResults.filter(obj => obj.type === 'item')
    },
    searchResultsFlows (state, getters) {
      return getters.searchResults.filter(obj => obj.type === 'flow')
    },
    loadedContent (state) {
      return state.loadedContent
    }
  },
  mutations: {
    setLoadedItemflow (state, payload) {
      state.loadedItemflow = payload
    },
    setSearchResults (state, payload) {
      state.searchResults = payload
    },
    addItemflow (state, payload) {
      state.loadedItemflow.push(payload)
    }
  },
  actions: {
    createItemflow ({ commit, getters, dispatch }, payload) {
      const uuid = _uuid()
      const obj = {
        id: uuid,
        type: payload.type || 'item',
        title: payload.title || '',
        message: payload.message || '',
        labels: payload.labels || [],
        createdDate: new Date().toISOString(),
        editedDate: new Date().toISOString(),
        favorite: false,
        clickRate: 0,
        itemContent: payload.itemContent || '',
        flowContent: payload.flowContent || []
      }
      storage.set(uuid, obj, error => {
        if (error) throw error

        dispatch('loadItemflowObj', uuid)
      })
    },
    removeItemflow ({ commit, getters, dispatch }, payload) {
      const objId = payload.id
      storage.remove(objId, error => {
        if (error) throw error

        dispatch('loadItemflow')
      })
    },
    updateItemflow ({ commit, getters, dispatch }, payload) {
      const objId = payload.id
      const obj = {
        type: payload.type,
        title: payload.title || '',
        message: payload.message || '',
        labels: payload.labels || [],
        labelsFrom: payload.labelsFrom || [],
        whoOwnMe: payload.whoOwnMe || [],
        editedDate: new Date().toISOString(),
        deletedDate: payload.deletedDate || false,
        favorite: payload.favorite || false,
        clickRate: payload.clickRate + 1,
        itemContent: payload.itemContent || '',
        flowContent: payload.flowContent || [],
        createdDate: payload.createdDate
      }
      storage.set(objId, obj, error => {
        if (error) throw error

        dispatch('loadItemflow')
      })
    },
    addWhoOwnMe ({ commit, getters, dispatch }, payload) {
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
      let updatedData = payload.updatedData
      let i = 0
      let len = targets ? targets.length : 0
      for (i = 0; i < len; i++) {
        let target = getters.loadedItemflowObj(targets[i].id)
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
        storage.set(target.id, target, error => {
          if (error) throw error
        })
      }
    },
    addLabelsFrom ({ commit, getters }, payload) {
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
      let updatedData = payload.updatedData

      let i = 0
      let len = targets ? targets.length : 0
      for (i = 0; i < len; i++) {
        let target = getters.loadedItemflowObj(targets[i].id)
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
        storage.set(target.id, target, error => {
          if (error) throw error
        })
      }
    },
    removeWhoOwnMe ({ commit, getters, dispatch }, payload) {
      // payload = {
      //   targetId: removedChip.id,
      //   removedObjId: this.$route.params.id
      // }

      let target = getters.loadedItemflowObj(payload.targetId)
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
      storage.set(target.id, target, error => {
        if (error) throw error
      })
    },
    removeLabelsFrom ({ commit, getters }, payload) {
      // payload = {
      //   targetId: removedChip.id,
      //   removedObjId: this.$route.params.id
      // }

      let target = getters.loadedItemflowObj(payload.targetId)
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
      storage.set(target.id, target, error => {
        if (error) throw error
      })
    },
    loadItemflow ({ commit, getters }) {
      commit('setLoading', true)
      // [Easily write and read user settings in Electron apps](https://github.com/electron-userland/electron-json-storage#module_storage.getDefaultDataPath)
      storage.getAll(function (error, data) {
        if (error) throw error

        let newItemflow = []
        for (let key in data) {
          newItemflow.push({
            id: key,
            type: data[key].type,
            title: data[key].title || '',
            message: data[key].message || '',
            labels: data[key].labels || [],
            labelsFrom: data[key].labelsFrom || [],
            whoOwnMe: data[key].whoOwnMe || [],
            createdDate: data[key].createdDate,
            editedDate: data[key].editedDate,
            deletedDate: data[key].deletedDate,
            favorite: data[key].favorite || false,
            clickRate: data[key].clickRate || 0,
            itemContent: data[key].itemContent || '',
            flowContent: data[key].flowContent || []
          })
        }
        commit('setLoadedItemflow', newItemflow)
        commit('setLoading', false)
      })
    },
    loadItemflowObj ({ commit, getters }, payload) {
      const uuid = payload
      commit('setLoading', true)
      // [Easily write and read user settings in Electron apps](https://github.com/electron-userland/electron-json-storage#module_storage.getDefaultDataPath)
      storage.get(uuid, function (error, data) {
        if (error) throw error

        let obj = {
          id: uuid,
          type: data.type,
          title: data.title || '',
          message: data.message || '',
          labels: data.labels || [],
          labelsFrom: data.labelsFrom || [],
          whoOwnMe: data.whoOwnMe || [],
          createdDate: data.createdDate,
          editedDate: data.editedDate,
          deletedDate: data.deletedDate,
          favorite: data.favorite || false,
          clickRate: data.clickRate || 0,
          itemContent: data.itemContent || '',
          flowContent: data.flowContent || []
        }
        commit('addItemflow', obj)
        commit('setLoading', false)
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
      let result = fuzzysort.go(payload, getters.loadedItemflow, {
        keys: ['title', 'message']
      })

      let searchResults = []
      let resultLength = result ? result.length : 0
      for (let i = 0; i < resultLength; i++) {
        searchResults.push(result[i].obj)
      }
      commit('setSearchResults', searchResults)
    },
    exportData ({ commit, getters }) {
      let loadeditemflow = getters.loadedItemflow
      let data = {}
      loadeditemflow.forEach(element => {
        let uuid = element.id
        delete element.id
        data[uuid] = element
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
      let data = payload

      if ((typeof data !== 'object') || (data === null)) {
        console.log('Error: is not object or is null')
        return
      }
      for (let key in data) {
        commit('setImporting', true)

        storage.set(key, data[key], error => {
          if (error) throw error
          commit('setImporting', false)
        })
      }
    }
  }
}

// [如何用 JavaScript 產生 UUID / GUID？](https://cythilya.github.io/2017/03/12/uuid/)
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
