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
        <item-content :content.sync="obj.itemContent" v-if="obj.type === 'item'"></item-content>
        <flow-content :content.sync="obj.flowContent" :whoOwnMe.sync="obj.whoOwnMe" v-if="obj.type === 'flow'"></flow-content>
      </v-flex>
    </v-layout>

  </v-layout>
</template>


<script>
  export default {
    props: ['id'],
    data () {
      return {
        obj: {
          type: '',
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
      this.obj.type = this.itemflowObj.type
      this.obj.title = this.itemflowObj.title || ''
      this.obj.message = this.itemflowObj.message || ''
      this.obj.labels = this.itemflowObj.labels || []
      this.obj.labelsFrom = this.itemflowObj.labelsFrom || []
      this.obj.whoOwnMe = this.itemflowObj.whoOwnMe || []
      this.obj.editedDate = this.itemflowObj.editedDate
      this.obj.favorite = this.itemflowObj.favorite || false
      this.obj.deletedDate = this.itemflowObj.deletedDate || false
      this.obj.clickRate = this.itemflowObj.clickRate || 0

      this.obj.itemContent = this.itemflowObj.itemContent || ''
      this.obj.flowContent = this.itemflowObj.flowContent || []
    },
    watch: {
      itemflowObj (newVal) {
        this.obj.type = newVal.type
        this.obj.title = newVal.title || ''
        this.obj.message = newVal.message || ''
        this.obj.labels = newVal.labels || []
        this.obj.labelsFrom = newVal.labelsFrom || []
        this.obj.whoOwnMe = newVal.whoOwnMe || []
        this.obj.editedDate = newVal.editedDate
        this.obj.favorite = newVal.favorite || false
        this.obj.deletedDate = newVal.deletedDate || false
        this.obj.clickRate = newVal.clickRate || 0
        this.obj.itemContent = newVal.itemContent || ''
        this.obj.flowContent = newVal.flowContent || []
      }
    },
    beforeRouteUpdate (to, from, next) {
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
        this.$store.dispatch('addLabelsFrom', {
          targets: this.obj.labels,
          updatedData: {
            id: this.id,
            type: this.obj.type,
            title: this.obj.title,
            message: this.obj.message
          }
        })
        this.$store.dispatch('addWhoOwnMe', {
          targets: this.obj.flowContent,
          updatedData: {
            id: this.id,
            type: this.obj.type,
            title: this.obj.title,
            message: this.obj.message
          }
        })
        next()
      }
    },
    beforeRouteLeave (to, from, next) {
      if (this.isDeleted) {
        next()
      } else {
        let newObj = {
          id: this.id,
          createdDate: this.itemflowObj.createdDate,
          ...this.obj
        }
        this.$store.dispatch('updateItemflow', newObj)
        this.$store.dispatch('addLabelsFrom', {
          targets: this.obj.labels,
          updatedData: {
            id: this.id,
            type: this.obj.type,
            title: this.obj.title,
            message: this.obj.message
          }
        })
        this.$store.dispatch('addWhoOwnMe', {
          targets: this.obj.flowContent,
          updatedData: {
            id: this.id,
            type: this.obj.type,
            title: this.obj.title,
            message: this.obj.message
          }
        })
        next()
      }
    }
  }
</script>
