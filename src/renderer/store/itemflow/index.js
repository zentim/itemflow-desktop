export default {
  state: {
    loadedItemFlow: [],
    loadedContent: {},
    searchResults: []
  },
  getters: {
    allItemflow (state) {
      return state.loadedItemFlow.filter(obj => !!obj.deletedDate === false)
    },
    loadedItemFlow (state, getters) {
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
    loadedItemFlowObj (state) {
      return ObjId => {
        return state.loadedItemFlow.find(obj => {
          return obj.id === ObjId
        })
      }
    },
    loadedItemflowByAmount (state, getters) {
      return amount => {
        return getters.loadedItemFlow.slice(0, amount)
      }
    },
    loadedItems (state, getters) {
      return getters.loadedItemFlow.filter(obj => obj.type === 'item')
    },
    loadedFlows (state, getters) {
      return getters.loadedItemFlow.filter(obj => obj.type === 'flow')
    },
    favoriteItemFlow (state, getters) {
      return getters.loadedItemFlow.filter(obj => obj.favorite === true)
    },
    deletedItemflow (state, getters) {
      return state.loadedItemFlow.filter(obj => !!obj.deletedDate === true)
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
    setLoadedItemFlow (state, payload) {
      state.loadedItemFlow = payload
    },
    setLoadedContent (state, payload) {
      state.loadedContent = payload
    },
    setSearchResults (state, payload) {
      state.searchResults = payload
    }
  },
  actions: {
    createItemFlow ({ commit, getters }, payload) {

    },
    removeItemFlow ({ commit, getters }, payload) {

    },
    updateItemFlow ({ commit, getters }, payload) {

    },
    addWhoHaveMe ({ commit, getters }, payload) {

    },
    addLabelsFrom ({ commit, getters }, payload) {

    },
    removeWhoHaveMe ({ commit, getters }, payload) {

    },
    removeLabelsFrom ({ commit, getters }, payload) {

    },
    loadItemFlow ({ commit, getters }) {

    },
    loadContent ({ commit, getters }, payload) {

    },
    searchItemFlow ({ commit, getters }, payload) {

    },
    exportData ({ commit, getters }) {

    },
    importData ({ commit, getters }, payload) {

    }
  }
}
