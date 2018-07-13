import Vue from 'vue'
import Vuex from 'vuex'

import itemflow from './itemflow'
import shared from './shared'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    itemflow: itemflow,
    shared: shared
  },
  strict: process.env.NODE_ENV !== 'production'
})
