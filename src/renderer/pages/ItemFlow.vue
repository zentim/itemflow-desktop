<template>
  <v-layout row wrap style="height: 100%">
    <!-- loading -->
    <loading v-show="loading"></loading>
    <!-- metadata -->
    <v-flex xs12 md4>
      <v-layout row wrap>
        <!-- save -->
        <v-flex d-flex xs12>
          <v-btn outline block color="indigo" @click="save" class="ma-0">save</v-btn>
        </v-flex>
        <!-- option -->
        <app-toolbar
          :id="id"
          :type.sync="obj.type"
          :isFavorite.sync="obj.favorite"
          :deletedDate.sync="obj.deletedDate"
          :itemflowObj="obj"
        ></app-toolbar>
        <!-- title -->
        <v-flex d-flex xs12>
          <v-text-field
            placeholder="Add title here..."
            v-model="obj.title"
            max="120"
            rows="3"
            full-width
            multi-line
            hide-details
            class="itemflow-title py-0"
          ></v-text-field>
        </v-flex>
        <!-- message -->
        <v-flex d-flex xs12>
          <v-text-field
            placeholder="Add message here..."
            v-model="obj.message"
            max="120"
            rows="8"
            full-width
            multi-line
            hide-details
            class="itemflow-message"
          ></v-text-field>
        </v-flex>

        <!-- label -->
        <v-flex d-flex xs12>
          <h4>
            <v-icon color="primary">local_offer</v-icon>Labels:
          </h4>
        </v-flex>
        <v-flex d-flex xs12>
          <app-labels :labels.sync="obj.labels" :labelsFrom="obj.labelsFrom" :key="id"></app-labels>
        </v-flex>
      </v-layout>
    </v-flex>
    <!-- content -->
    <v-flex d-flex xs12 md8 style="height: 100%">
      <item-content :itemcontent.sync="obj.itemContent" v-show="obj.type === 'item'" :id="obj.id"></item-content>
      <flow-content :flowcontent.sync="obj.flowContent" v-show="obj.type === 'flow'"></flow-content>
    </v-flex>

    <!-- right -->
    <!-- z-index is fixing flow content delete show problem in small size screen.  -->
    <v-navigation-drawer
      fixed
      clipped
      right
      :value="rightDrawer"
      :hide-overlay="rightDrawer"
      width="250"
      style="z-index: 200"
      v-show="this.$route.name !== 'Home'"
      app
      stateless
    >
      <div style="position: relative">
        <v-icon
          class="hidden-lg-and-up px-2 py-2"
          style="cursor: pointer"
          large
          @click.stop="toggleRightDrawer"
        >keyboard_tab</v-icon>
        <right-drawer-content></right-drawer-content>
        <!-- fix cannot scroll list in small size screen.  -->
        <div class="coverArea hidden-md-and-up"></div>
      </div>
    </v-navigation-drawer>
  </v-layout>
</template>


<script>
import {
  storageSetDataPath,
  storageHas,
  storageGet,
  storageSet
} from '../helper/storageHelper'
import { uuid } from '../helper/idHelper'
export default {
  props: {
    id: {
      type: String,
      default: 'new'
    }
  },
  data () {
    return {
      sourceObj: null,
      obj: {
        id: '',
        type: 'item',
        title: '',
        message: '',
        labels: [],
        labelsFrom: [],
        whoOwnMe: [],
        favorite: false,
        createdDate: '',
        editedDate: '',
        deletedDate: '',
        clickRate: 0,
        itemContent: '',
        flowContent: []
      }
    }
  },
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    searching () {
      return this.$store.getters.searching
    },
    rightDrawer () {
      return this.$store.getters.rightDrawer
    },
    isEmpty () {
      return !this.obj.title && !this.obj.message && !this.obj.itemContent && (!Array.isArray(this.obj.labels) || this.obj.labels.length === 0)
    }
  },
  watch: {
    id (newVal) {
      console.log('watch new id: ' + newVal)
      this.getItemflowData()
    }
  },
  beforeCreate () {
    console.log('beforeCreate')
  },
  created () {
    console.log('created')
  },
  beforeMount () {
    console.log('beforeMount')
  },
  mounted () {
    console.log('mounted')
    this.getItemflowData()
  },
  beforeUpdate () {
    console.log('beforeUpdate')
  },
  updated () {
    console.log('updated')
  },
  beforeDestroy () {
    console.log('beforeDestroy')
  },
  destroyed () {
    console.log('destroyed')
  },
  methods: {
    async getItemflowData () {
      console.log('test id:' + this.id)
      if (this.id === 'new') {
        const newId = uuid()
        console.log(`this is a new itemflow, give it id: ${newId}`)
        this._onCreateItemflow(newId)
        return
      }

      console.log('############### getItemflowData START ###############')
      let absPath = storageSetDataPath('/temp')
      let hasKey = await storageHas(this.id)

      // has key in /temp
      if (hasKey) {
        console.log(`has ${this.id}.json in: ${absPath}`)

        let data = await storageGet(this.id)
        this._setObjWithData(data)
        console.log('############### getItemflowData END (a) ###############')
        return
      }

      absPath = storageSetDataPath('/data')
      hasKey = await storageHas(this.id)

      // has key in /data
      if (hasKey) {
        console.log(`has ${this.id}.json in: ${absPath}`)

        let data = await storageGet(this.id)
        this._setObjWithData(data)
      }
      console.log('############### getItemflowData END (b) ###############')
    },
    _onCreateItemflow (newId) {
      console.log('############### _onCreateItemflow START ###############')
      console.log('(create mode) source obj: ')
      this.sourceObj = {
        id: newId,
        type: 'item',
        title: '',
        message: '',
        labels: [],
        labelsFrom: [],
        whoOwnMe: [],
        favorite: false,
        createdDate: '',
        editedDate: '',
        deletedDate: '',
        clickRate: 0,
        itemContent: '',
        flowContent: []
      }
      console.log(this.sourceObj)

      console.log('(create mode) this obj: ')
      this.obj = {
        id: newId,
        type: 'item',
        title: '',
        message: '',
        labels: [],
        labelsFrom: [],
        whoOwnMe: [],
        favorite: false,
        createdDate: '',
        editedDate: '',
        deletedDate: '',
        clickRate: 0,
        itemContent: '',
        flowContent: []
      }
      console.log(this.obj)
      console.log('############### _onCreateItemflow END ###############')
    },
    _setObjWithData (data) {
      // set source obj
      this.sourceObj = data
      console.log('source obj: ')
      console.log(this.sourceObj)

      // process data
      this.obj.id = data.id
      this.obj.type = data.type
      this.obj.title = data.title
      this.obj.message = data.message
      this.obj.createdDate = data.createdDate
      this.obj.editedDate = data.editedDate
      this.obj.deletedDate = data.deletedDate
      this.obj.favorite = data.favorite
      this.obj.clickRate = data.clickRate

      this.obj.itemContent = data.itemContent
      this.obj.flowContent = this._getMetaInfo(data.flowContent)
      this.obj.labels = this._getMetaInfo(data.labels)
      this.obj.labelsFrom = this._getMetaInfo(data.labelsFrom)
      this.obj.whoOwnMe = this._getMetaInfo(data.whoOwnMe)
      console.log('this obj: ')
      console.log(this.obj)
    },
    _getMetaInfo (keyArray) {
      let metaInfoArray = []
      for (let i = 0; i < keyArray.length; i++) {
        let obj = this.$store.getters.itemflowStoreObj(keyArray[i])
        if (obj !== undefined && obj !== null) {
          metaInfoArray.push(obj)
        }
      }
      return metaInfoArray
    },
    async checkFlow (flowContentOrLabels, whoOwnMeOrLabelsFrom) {
      if (this.sourceObj === undefined || this.sourceObj === null) {
        console.log('checkFlow Alert: this.sourceObj is ' + this.sourceObj)
        return
      }
      // let flowContentOrLabels = 'flowContent' || 'labels'
      // let whoOwnMeOrLabelsFrom = 'whoOwnMe' || 'labelsFrom'
      console.log(`******************** check ${flowContentOrLabels} START ******************`)
      let oldKeyArray = this.sourceObj[flowContentOrLabels].slice()
      let newKeyArray = this.obj[flowContentOrLabels].slice().map(obj => obj.id)
      let isSameKeyArray = oldKeyArray.sort().toString() === newKeyArray.sort().toString()

      if (isSameKeyArray) {
        console.log('300: isSameKeyArray so return')
        return
      }

      // check added
      let addedArray = []
      newKeyArray.forEach(key => {
        if (!oldKeyArray.includes(key)) {
          if (key !== undefined && key !== null) {
            addedArray.push(key)
          }
        }
      })
      if (addedArray.length) {
        console.log('新增加的:')
        console.log(addedArray)

        // add self to other's whoOwnMe/tagFrom
        for (let key of addedArray) {
          storageSetDataPath('/temp')
          let hasKey = await storageHas(key)
          console.log('253: hasKey = ' + hasKey)

          // has key in /temp
          if (hasKey) {
            let data = await storageGet(key)
            data[whoOwnMeOrLabelsFrom].push(this.obj.id)
            data[whoOwnMeOrLabelsFrom] = [...(new Set(data[whoOwnMeOrLabelsFrom]))]
            storageSetDataPath('/temp')
            try {
              console.log(await storageSet(key, data))
            } catch (error) {
              throw error
            }
            console.log('a增加成功!!!')
            console.log(data)
          } else {
            storageSetDataPath('/data')
            hasKey = await storageHas(key)

            // has key in /data
            if (hasKey) {
              let data = await storageGet(key)
              data[whoOwnMeOrLabelsFrom].push(this.obj.id)
              data[whoOwnMeOrLabelsFrom] = [...(new Set(data[whoOwnMeOrLabelsFrom]))]
              storageSetDataPath('/temp')
              try {
                console.log(await storageSet(key, data))
              } catch (error) {
                throw error
              }
              console.log('b增加成功!!!')
              console.log(data)
            } else {
              // does not has key in /temp and /data
              console.log(`does not has key(${key}) in /temp and /data`)
            }
          }
        }
      }

      // check deleted
      let deletedArray = []
      oldKeyArray.forEach(key => {
        if (!newKeyArray.includes(key)) {
          if (key !== undefined && key !== null) {
            deletedArray.push(key)
          }
        }
      })
      if (deletedArray.length) {
        console.log('新刪除的:')
        console.log(deletedArray)

        // delete self from other's whoOwnMe/tagFrom
        for (let key of deletedArray) {
          storageSetDataPath('/temp')
          let hasKey = await storageHas(key)
          console.log('378: hasKey = ' + hasKey)

          // has key in /temp
          if (hasKey) {
            storageSetDataPath('/temp')
            let data = await storageGet(key)
            data[whoOwnMeOrLabelsFrom] = data[whoOwnMeOrLabelsFrom].filter(key => {
              return key !== this.obj.id
            })
            storageSetDataPath('/temp')
            await storageSet(key, data)
            console.log('a刪除成功!!!')
            console.log(data)
          } else {
            storageSetDataPath('/data')
            hasKey = await storageHas(key)

            // has key in /data
            if (hasKey) {
              storageSetDataPath('/data')
              let data = await storageGet(key)
              data[whoOwnMeOrLabelsFrom] = data[whoOwnMeOrLabelsFrom].filter(key => {
                return key !== this.obj.id
              })
              storageSetDataPath('/temp')
              await storageSet(key, data)
              console.log('b刪除成功!!!')
              console.log(data)
            } else {
              // does not has key in /temp and /data
              console.log(`does not has key(${key}) in /temp and /data`)
            }
          }
        }
      }
      console.log(`******************** check ${flowContentOrLabels} END ******************`)

      return new Promise((resolve, reject) => {
        resolve(`***************** check ${flowContentOrLabels} END (resolve)*********************`)
      })
    },
    toggleRightDrawer () {
      let rightDrawer = this.rightDrawer
      this.$store.dispatch('setRightDrawer', !rightDrawer)
    },
    async save () {
      let newObj = this.obj
      this.$store.dispatch('updateItemflow', newObj)
      let checkFlowResult = await this.checkFlow('flowContent', 'whoOwnMe')
      let checkLabelResult = await this.checkFlow('labels', 'labelsFrom')
      console.log('checkFlowResult:' + checkFlowResult)
      console.log('checkLabelResult:' + checkLabelResult)
    }
  },
  async beforeRouteEner (to, from, next) {
    console.log('=======================(beforeRouteEner START)=============================')
    console.log('434: ' + this.id)

    // for create new itemflow
    if (this.id === 'new') {
      console.log('*********** new ***********')
      if (this.isEmpty) {
        console.log('_onCreateItemflow Info: content is empty, so does not create.')
        next()
        return
      }
    }

    // for update old itemflow
    let newObj = this.obj
    console.log('448:')
    console.log(newObj)
    let updateItemflowResult = await this.$store.dispatch('updateItemflow', newObj)
    console.log('updateItemflowResult:' + updateItemflowResult)
    if (newObj.deletedDate && this.searching) {
      this.$store.dispatch('searchItemFlow')
    }

    // for check flow and label
    let checkFlowResult = await this.checkFlow('flowContent', 'whoOwnMe')
    let checkLabelResult = await this.checkFlow('labels', 'labelsFrom')
    console.log('checkFlowResult:' + checkFlowResult)
    console.log('checkLabelResult:' + checkLabelResult)
    next()
    console.log('=======================(beforeRouteEner END)=============================')
  },
  async beforeRouteUpdate (to, from, next) {
    console.log('=======================(beforeRouteUpdate START)=============================')
    // 对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    console.log('423: ' + this.id)

    // for create new itemflow
    if (this.id === 'new') {
      console.log('*********** new ***********')
      if (this.isEmpty) {
        console.log('_onCreateItemflow Info: content is empty, so does not create.')
        next()
        return
      }
    }

    // for update old itemflow
    let newObj = this.obj
    console.log('444:')
    console.log(newObj)
    let updateItemflowResult = await this.$store.dispatch('updateItemflow', newObj)
    console.log('updateItemflowResult:' + updateItemflowResult)
    if (newObj.deletedDate && this.searching) {
      this.$store.dispatch('searchItemFlow')
    }

    // for check flow and label
    let checkFlowResult = await this.checkFlow('flowContent', 'whoOwnMe')
    let checkLabelResult = await this.checkFlow('labels', 'labelsFrom')
    console.log('checkFlowResult:' + checkFlowResult)
    console.log('checkLabelResult:' + checkLabelResult)
    next()
    console.log('=======================(beforeRouteUpdate END)=============================')
  },
  async beforeRouteLeave (to, from, next) {
    console.log('=======================(beforeRouteLeave START)=============================')
    console.log('456: ' + this.id)
    // for create new itemflow
    if (this.id === 'new') {
      console.log('*********** new ***********')
      if (this.isEmpty) {
        console.log('_onCreateItemflow Info: content is empty, so does not create.')
        next()
        return
      }
    }

    // for update old itemflow
    let newObj = this.obj
    console.log('444:')
    console.log(newObj)
    let updateItemflowResult = await this.$store.dispatch('updateItemflow', newObj)
    console.log('updateItemflowResult:' + updateItemflowResult)
    if (newObj.deletedDate && this.searching) {
      this.$store.dispatch('searchItemFlow')
    }

    // for check flow and label
    let checkFlowResult = await this.checkFlow('flowContent', 'whoOwnMe')
    let checkLabelResult = await this.checkFlow('labels', 'labelsFrom')
    console.log('checkFlowResult:' + checkFlowResult)
    console.log('checkLabelResult:' + checkLabelResult)
    next()
    console.log('=======================(beforeRouteLeave END)=============================')
  }
}
</script>
<style scoped>
.itemflow-title {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.87);
  line-height: normal;
}
.itemflow-message {
  font-size: 12px;
  font-weight: 300;
  color: rgba(0, 0, 0, 0.6);
  line-height: normal;
}
.input-group--text-field textarea {
  font-size: 12px !important;
}
.input-group--text-field textarea {
  font-size: 10px !important;
}
</style>