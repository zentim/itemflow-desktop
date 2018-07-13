const storage = require('electron-json-storage')
export default {
  state: {
    loadedItemflow: [],
    loadedContent: {},
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
    setLoadedContent (state, payload) {
      state.loadedContent = payload
    },
    setSearchResults (state, payload) {
      state.searchResults = payload
    }
  },
  actions: {
    createItemflow ({ commit, getters }, payload) {

    },
    removeItemflow ({ commit, getters }, payload) {

    },
    updateItemflow ({ commit, getters }, payload) {

    },
    addWhoHaveMe ({ commit, getters }, payload) {

    },
    addLabelsFrom ({ commit, getters }, payload) {

    },
    removeWhoHaveMe ({ commit, getters }, payload) {

    },
    removeLabelsFrom ({ commit, getters }, payload) {

    },
    loadItemflow ({ commit, getters }) {
      commit('setLoading', true)
      // [Easily write and read user settings in Electron apps](https://github.com/electron-userland/electron-json-storage#module_storage.getDefaultDataPath)
      storage.get('itemflow', function (error, data) {
        if (error) throw error

        console.log(data)
        commit('setLoading', false)
      })
    },
    loadContent ({ commit, getters }, payload) {

    },
    searchItemflow ({ commit, getters }, payload) {

    },
    exportData ({ commit, getters }) {

    },
    importData ({ commit, getters }, payload) {

    },
    readDataFromDisk ({ commit, getters }) {

    },
    saveDataIntoDisk ({ commit, getters }) {

    }
  }
}
