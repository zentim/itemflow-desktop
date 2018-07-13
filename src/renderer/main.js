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
import ItemFlowSearch from './components/Shared/ItemFlowSearch'
import ItemFlowCard from './components/Shared/ItemFlowCard'
import Draggable from 'vuedraggable'
import RightDrawerContent from './components/Shared/RightDrawerContent'
import ItemFlowToolbar from './components/Shared/ItemFlowToolbar'
import ItemFlowOutline from './components/Shared/ItemFlowOutline'
// import tinymce from 'vue-tinymce-editor'
import ItemContent from './components/Item/ItemContent'
import FlowContent from './components/Flow/FlowContent'
import Labels from './components/Shared/Labels'

Vue.use(Vuetify,
  {
    theme: {
      primary: '#ee44aa',
      secondary: '#ececec',
      accent: '#82B1FF',
      error: '#FF5252',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FFC107',

      // logo color
      LogoItemColor: '#5FB878',
      LogoFlowColor: '#1E9FFF'
    }
  }
)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.component('loading', Loading)
Vue.component('app-alert', Alert)
Vue.component('app-snackbar', Snackbar)
Vue.component('app-search', ItemFlowSearch)
Vue.component('itemflow-card', ItemFlowCard)
Vue.component('draggable', Draggable)
Vue.component('right-drawer-content', RightDrawerContent)
Vue.component('app-toolbar', ItemFlowToolbar)
Vue.component('item-flow-outline', ItemFlowOutline)
// Vue.component('tinymce', tinymce)
Vue.component('item-content', ItemContent)
Vue.component('flow-content', FlowContent)
Vue.component('app-labels', Labels)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
