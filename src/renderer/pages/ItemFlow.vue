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
      <item-content :itemcontent.sync="obj.itemContent" v-show="obj.type === 'item'"></item-content>
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
const storage = require('electron-json-storage')
export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      obj: {
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
    getItemflowData () {
      let that = this
      storage.setDataPath(storage.getDefaultDataPath() + '/temp')
      storage.has(that.id, function (error, hasKey) {
        if (error) throw error

        if (hasKey) {
          console.log('has ' + that.id + '.json in: ' + storage.getDefaultDataPath() + '/temp')

          storage.get(that.id, function (error, data) {
            if (error) throw error

            let target = data
            console.log(target)
            that.obj.type = target.type
            that.obj.title = target.title
            that.obj.message = target.message
            that.obj.createdDate = target.createdDate
            that.obj.editedDate = target.editedDate
            that.obj.deletedDate = target.deletedDate
            that.obj.favorite = target.favorite
            that.obj.clickRate = target.clickRate

            that.obj.itemContent = target.itemContent
            that.obj.flowContent = target.flowContent
            that.obj.labels = target.labels
            that.obj.labelsFrom = target.labelsFrom
            that.obj.whoOwnMe = target.whoOwnMe
          })
        } else {
          storage.setDataPath(storage.getDefaultDataPath() + '/data')
          storage.has(that.id, function (error, hasKey) {
            if (error) throw error

            if (hasKey) {
              console.log('has ' + that.id + '.json in: ' + storage.getDefaultDataPath() + '/data')

              storage.get(that.id, function (error, data) {
                if (error) throw error

                let target = data
                console.log(target)
                that.obj.type = target.type
                that.obj.title = target.title
                that.obj.message = target.message
                that.obj.createdDate = target.createdDate
                that.obj.editedDate = target.editedDate
                that.obj.deletedDate = target.deletedDate
                that.obj.favorite = target.favorite
                that.obj.clickRate = target.clickRate

                that.obj.itemContent = target.itemContent
                that.obj.flowContent = target.flowContent
                that.obj.labels = target.labels
                that.obj.labelsFrom = target.labelsFrom
                that.obj.whoOwnMe = target.whoOwnMe
              })
            }
          })
        }
      })
    },
    // updateTargetsInfo (targets, targetsName) {
    //   // targets is empty will return newTargets, that meaning return []
    //   let newTargets = []
    //   let thisId = this.id
    //   targets.forEach(target => {
    //     // skip if the target id is undefined
    //     if (target.id === undefined) {
    //       return
    //     }

    //     // skip if the targetObj does not exist or deleted
    //     let targetObj = this.$store.getters.itemflowStoreObj(target.id)
    //     if (targetObj === undefined || Object.getOwnPropertyNames(targetObj).length === 0 || targetObj.deletedDate) {
    //       console.log('Alert: target is undefined or emtyp object')
    //       return
    //     }

    //     // check for labelsFrom or whoOwnMe,
    //     // skip if this does not exist in the targetObj labels or flowContent
    //     if (targetsName === 'labelsFrom' || targetsName === 'whoOwnMe') {
    //       // arrIndex return -1 is meaning checkId does not exist in arr
    //       let arr = (targetsName === 'labelsFrom') ? targetObj.labels : targetObj.flowContent
    //       let checkId = thisId
    //       if (arr === undefined) {
    //         console.log('Alert: target is undefined')
    //         return
    //       }
    //       let arrIndex = arr.map((item, index) => {
    //         return item.id
    //       }).indexOf(checkId)

    //       if (arrIndex === -1) {
    //         return
    //       }
    //     }

    //     // arrIndex return -1 is meaning checkId does not exist in arr
    //     let arr = newTargets
    //     let checkId = target.id
    //     let arrIndex = arr.map((item, index) => {
    //       return item.id
    //     }).indexOf(checkId)

    //     // check for duplicates, only push it into when it
    //     // does not exist in newTargets
    //     if (arrIndex === -1) {
    //       newTargets.push({
    //         id: targetObj.id,
    //         type: targetObj.type,
    //         title: targetObj.title,
    //         message: targetObj.message
    //       })
    //     }
    //   })

    //   return newTargets
    // },
    toggleRightDrawer () {
      let rightDrawer = this.rightDrawer
      this.$store.dispatch('setRightDrawer', !rightDrawer)
    },
    save () {
      let newObj = {
        id: this.id,
        ...this.obj
      }
      this.$store.dispatch('updateItemflow', newObj)
    }
  },
  beforeRouteUpdate (to, from, next) {
    // 对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    let newObj = {
      id: this.id,
      ...this.obj
    }
    this.$store.dispatch('updateItemflow', newObj)
    if (newObj.deletedDate && this.searching) {
      this.$store.dispatch('searchItemFlow')
    }

    next()
  },
  beforeRouteLeave (to, from, next) {
    let newObj = {
      id: this.id,
      ...this.obj
    }
    this.$store.dispatch('updateItemflow', newObj)
    if (newObj.deletedDate && this.searching) {
      this.$store.dispatch('searchItemFlow')
    }

    next()
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