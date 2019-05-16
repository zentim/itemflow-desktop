<template>
  <v-layout>

    <!-- loading -->
    <v-layout row wrap v-if="loading">
      <loading></loading>
    </v-layout>

    <!-- main -->
    <v-layout row wrap v-else>
      <v-flex xs12 md4>
        <v-card flat style="border-top: #aaa solid 1px">
          <app-toolbar
            :id="id"
            :type.sync="obj.type"
            :isFavorite.sync="obj.favorite"
            :deletedDate.sync="obj.deletedDate"
            :itemflowObj="obj"></app-toolbar>
          <item-flow-outline
            :id="id"
            :title.sync="obj.title"
            :message.sync="obj.message"
            :labels.sync="obj.labels"
            :labelsFrom="obj.labelsFrom"></item-flow-outline>
        </v-card>
      </v-flex>
      <v-flex xs12 md8>
        <item-content :itemcontent.sync="obj.itemContent" v-show="obj.type === 'item'"></item-content>
        <flow-content :flowcontent.sync="obj.flowContent" v-show="obj.type === 'flow'"></flow-content>
      </v-flex>
    </v-layout>

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
    >
      <div style="position: relative">
        <v-icon class="hidden-lg-and-up px-2 py-2" style="cursor: pointer" large @click.stop="toggleRightDrawer">keyboard_tab</v-icon>
        <right-drawer-content></right-drawer-content>
        <!-- fix cannot scroll list in small size screen.  -->
        <div class="coverArea hidden-md-and-up"></div>
      </div>
    </v-navigation-drawer>

  </v-layout>
</template>


<script>
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
      itemflowObj () {
        return this.$store.getters.itemflowStoreObj(this.id)
      },
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
    mounted () {
      this.$nextTick(function () {
        // Code that will run only after the
        // entire view has been rendered
        let target = this.itemflowObj

        if (target === undefined || Object.getOwnPropertyNames(target).length === 0) {
          console.log('Alert: target is undefined or emtyp object')
          return
        }

        this.obj.type = target.type
        this.obj.title = target.title
        this.obj.message = target.message
        this.obj.labels = this.updateTargetsInfo(target.labels, 'labels')
        this.obj.labelsFrom = this.updateTargetsInfo(target.labelsFrom, 'labelsFrom')
        this.obj.whoOwnMe = this.updateTargetsInfo(target.whoOwnMe, 'whoOwnMe')
        this.obj.createdDate = target.createdDate
        this.obj.editedDate = target.editedDate
        this.obj.deletedDate = target.deletedDate
        this.obj.favorite = target.favorite
        this.obj.clickRate = target.clickRate

        this.obj.itemContent = target.itemContent
        this.obj.flowContent = this.updateTargetsInfo(target.flowContent, 'flowContent')
      })
    },
    watch: {
      itemflowObj (newVal) {
        let target = newVal

        if (target === undefined || Object.getOwnPropertyNames(target).length === 0) {
          console.log('Alert: target is undefined or emtyp object')
          return
        }

        this.obj.type = target.type
        this.obj.title = target.title
        this.obj.message = target.message
        this.obj.labels = this.updateTargetsInfo(target.labels, 'labels')
        this.obj.labelsFrom = this.updateTargetsInfo(target.labelsFrom, 'labelsFrom')
        this.obj.whoOwnMe = this.updateTargetsInfo(target.whoOwnMe, 'whoOwnMe')
        this.obj.createdDate = target.createdDate
        this.obj.editedDate = target.editedDate
        this.obj.deletedDate = target.deletedDate
        this.obj.favorite = target.favorite
        this.obj.clickRate = target.clickRate

        this.obj.itemContent = target.itemContent
        this.obj.flowContent = this.updateTargetsInfo(target.flowContent, 'flowContent')
      }
    },
    methods: {
      updateTargetsInfo (targets, targetsName) {
        // targets is empty will return newTargets, that meaning return []
        let newTargets = []
        let thisId = this.id
        targets.forEach(target => {
          // skip if the target id is undefined
          if (target.id === undefined) {
            return
          }

          // skip if the targetObj does not exist
          let targetObj = this.$store.getters.itemflowStoreObj(target.id)
          if (targetObj === undefined || Object.getOwnPropertyNames(targetObj).length === 0) {
            console.log('Alert: target is undefined or emtyp object')
            return
          }

          // check for labelsFrom or whoOwnMe,
          // skip if this does not exist in the targetObj labels or flowContent
          if (targetsName === 'labelsFrom' || targetsName === 'whoOwnMe') {
            // arrIndex return -1 is meaning checkId does not exist in arr
            let arr = (targetsName === 'labelsFrom') ? targetObj.labels : targetObj.flowContent
            let checkId = thisId
            if (arr === undefined) {
              console.log('Alert: target is undefined')
              return
            }
            let arrIndex = arr.map((item, index) => {
              return item.id
            }).indexOf(checkId)

            if (arrIndex === -1) {
              return
            }
          }

          // arrIndex return -1 is meaning checkId does not exist in arr
          let arr = newTargets
          let checkId = target.id
          let arrIndex = arr.map((item, index) => {
            return item.id
          }).indexOf(checkId)

          // check for duplicates, only push it into when it
          // does not exist in newTargets
          if (arrIndex === -1) {
            newTargets.push({
              id: targetObj.id,
              type: targetObj.type,
              title: targetObj.title,
              message: targetObj.message
            })
          }
        })

        return newTargets
      },
      toggleRightDrawer () {
        let rightDrawer = this.rightDrawer
        this.$store.dispatch('setRightDrawer', !rightDrawer)
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

      // output
      // this.$store.dispatch('outputItemflowStore')
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

      // output
      // this.$store.dispatch('outputItemflowStore')
      next()
    }
  }
</script>
