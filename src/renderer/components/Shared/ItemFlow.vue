<template>
  <v-layout>

    <!-- loading -->
    <v-layout row wrap v-if="loading">
      <loading></loading>
    </v-layout>

    <!-- main -->
    <v-layout row wrap v-else>
      <v-flex xs12 md4>
        <v-card flat>
          {{obj.itemContent}}
          {{obj.flowContent}}
          <app-toolbar
            :id="id"
            :type.sync="obj.type"
            :isFavorite.sync="obj.favorite"
            :isDeleted.sync="isDeleted"
            :deletedDate.sync="obj.deletedDate"></app-toolbar>
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
        <flow-content :flowcontent.sync="obj.flowContent" :whoOwnMe.sync="obj.whoOwnMe" v-show="obj.type === 'flow'"></flow-content>
      </v-flex>
    </v-layout>

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
          itemContent: '',
          flowContent: [],
          whoOwnMe: [],
          favorite: null,
          deletedDate: null,
          clickRate: 0
        },
        isDeleted: false
      }
    },
    computed: {
      itemflowObj () {
        return this.$store.getters.itemflowStoreObj(this.id)
      },
      loading () {
        return this.$store.getters.loading
      }
    },
    mounted () {
      let obj = this.itemflowObj
      this.obj.type = obj.type ? obj.type : 'item'
      this.obj.title = obj.title ? obj.title : ''
      this.obj.message = obj.message ? obj.message : ''
      this.obj.labels = obj.labels ? obj.labels : []
      this.obj.labelsFrom = obj.labelsFrom ? obj.labelsFrom : []
      this.obj.whoOwnMe = obj.whoOwnMe ? obj.whoOwnMe : []
      this.obj.editedDate = obj.editedDate ? obj.editedDate : ''
      this.obj.deletedDate = obj.deletedDate ? obj.deletedDate : ''
      this.obj.favorite = obj.favorite ? obj.favorite : false
      this.obj.clickRate = obj.clickRate ? obj.clickRate : 0

      this.obj.itemContent = obj.itemContent ? obj.itemContent : ''
      this.obj.flowContent = obj.flowContent ? obj.flowContent : []
    },
    watch: {
      itemflowObj (newVal) {
        let obj = newVal
        this.obj.type = obj.type ? obj.type : 'item'
        this.obj.title = obj.title ? obj.title : ''
        this.obj.message = obj.message ? obj.message : ''
        this.obj.labels = obj.labels ? obj.labels : []
        this.obj.labelsFrom = obj.labelsFrom ? obj.labelsFrom : []
        this.obj.whoOwnMe = obj.whoOwnMe ? obj.whoOwnMe : []
        this.obj.editedDate = obj.editedDate ? obj.editedDate : ''
        this.obj.deletedDate = obj.deletedDate ? obj.deletedDate : ''
        this.obj.favorite = obj.favorite ? obj.favorite : false
        this.obj.clickRate = obj.clickRate ? obj.clickRate : 0

        this.obj.itemContent = obj.itemContent ? obj.itemContent : ''
        this.obj.flowContent = obj.flowContent ? obj.flowContent : []
      }
    },
    beforeRouteUpdate (to, from, next) {
      console.log('101: beforeRouteUpdate')
      // 对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
      // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
      if (this.isDeleted) {
        next()
      } else {
        let newObj = {
          id: this.id,
          createdDate: this.itemflowObj.createdDate,
          ...this.obj
        }
        this.$store.dispatch('updateItemflow', newObj)
        next()
      }
    },
    beforeRouteLeave (to, from, next) {
      console.log('101: beforeRouteLeave')
      if (this.isDeleted) {
        next()
      } else {
        let newObj = {
          id: this.id,
          createdDate: this.itemflowObj.createdDate,
          ...this.obj
        }
        this.$store.dispatch('updateItemflow', newObj)
        next()
      }
    }
  }
</script>
