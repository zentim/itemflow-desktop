export default {
  state: {
    loading: false,
    error: null,
    errorText: null,
    searching: false,
    importing: false,
    rightDrawer: true,
    draggableItem: null
  },
  getters: {
    loading (state) {
      return state.loading
    },
    error (state) {
      return state.error
    },
    errorText (state) {
      return state.errorText
    },
    searching (state) {
      return state.searching
    },
    importing (state) {
      return state.importing
    },
    rightDrawer (state) {
      return state.rightDrawer
    },
    draggableItem (state) {
      return state.draggableItem
    }
  },
  mutations: {
    setLoading (state, payload) {
      state.loading = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    setErrorText (state, payload) {
      state.errorText = payload
    },
    clearError (state) {
      state.error = null
    },
    setSearching (state, payload) {
      state.searching = payload
    },
    setImporting (state, payload) {
      state.importing = payload
    },
    setRightDrawer (state, payload) {
      state.rightDrawer = payload
    },
    setDraggableItem (state, payload) {
      state.draggableItem = payload
    }
  },
  actions: {
    setErrorText ({ commit }, payload) {
      commit('setErrorText', payload)
    },
    clearError ({ commit }) {
      commit('clearError')
    },
    setImporting ({ commit }, payload) {
      commit('setImporting', payload)
    },
    setRightDrawer ({ commit }, payload) {
      commit('setRightDrawer', payload)
    },
    setDraggableItem ({ commit }, payload) {
      commit('setDraggableItem', payload)
    }
  }
}
