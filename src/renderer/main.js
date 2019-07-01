import 'material-design-icons-iconfont/dist/material-design-icons.css'
import Vue from 'vue'
import axios from 'axios'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

import App from './App'
import router from './router'
import store from './store'

import Loading from './components/Shared/Loading'
import Alert from './components/Shared/Alert'
import Snackbar from './components/Shared/Snackbar'
import ItemflowSearch from './components/Shared/ItemflowSearch'
import ItemflowCard from './components/Shared/ItemflowCard'
import Draggable from 'vuedraggable'
import RightDrawerContent from './components/Shared/RightDrawerContent'
import ItemflowToolbar from './components/Shared/ItemflowToolbar'
import ItemContent from './components/Item/ItemContent'
import FlowContent from './components/Flow/FlowContent'
import Labels from './components/Shared/Labels'
import GraphArea from './components/Shared/GraphArea'

/**
 * For open chrome dev tool after build
 * `crtl + shift + k` will open dev tools.
 */
import { remote } from 'electron'

remote.globalShortcut.register('CommandOrControl+Shift+K', () => {
  remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
})

window.addEventListener('beforeunload', () => {
  remote.globalShortcut.unregisterAll()
})

/**
 * Setting vue
 */
Vue.use(Vuetify, {
  theme: {
    primary: '#ee44aa',
    // secondary: '#ececec',
    secondary: '#fff',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',

    // logo color
    LogoItemColor: '#5FB878',
    LogoFlowColor: '#1E9FFF'
  }
})
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.component('loading', Loading)
Vue.component('app-alert', Alert)
Vue.component('app-snackbar', Snackbar)
Vue.component('app-search', ItemflowSearch)
Vue.component('itemflow-card', ItemflowCard)
Vue.component('draggable', Draggable)
Vue.component('right-drawer-content', RightDrawerContent)
Vue.component('app-toolbar', ItemflowToolbar)
Vue.component('item-content', ItemContent)
Vue.component('flow-content', FlowContent)
Vue.component('app-labels', Labels)
Vue.component('graph-area', GraphArea)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
  created () {
    this.$store.dispatch('loadItemflow')
  }
}).$mount('#app')
