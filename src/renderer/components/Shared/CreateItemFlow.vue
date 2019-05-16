<template>
  <v-layout>
    <v-layout row wrap>
      <v-flex xs12 md4>
        <v-card class="pt-3" flat style="border-top: #aaa solid 1px">
          <item-flow-outline
            :id="id"
            :title.sync="title"
            :message.sync="message"
            :labels.sync="labels"></item-flow-outline>
        </v-card>
      </v-flex>

      <v-flex xs12 md8>
        <item-content :itemcontent.sync="itemContent"></item-content>
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
    data () {
      return {
        id: 'new',
        title: '',
        message: '',
        itemContent: '',
        labels: [],
        isCreated: false
      }
    },
    computed: {
      isEmpty () {
        return !this.title && !this.message && !this.itemContent && (!Array.isArray(this.labels) || this.labels.length === 0)
      },
      rightDrawer () {
        return this.$store.getters.rightDrawer
      }
    },
    methods: {
      onCreateItemflow () {
        if (this.isEmpty) {
          return
        }

        let newLabels = []
        if (Array.isArray(this.labels)) {
          // format labels structure
          let labels = this.labels
          for (let i = 0; i < labels.length; i++) {
            newLabels.push({
              id: labels[i].id,
              type: labels[i].type,
              title: labels[i].title ? labels[i].title : '',
              message: labels[i].message ? labels[i].message : ''
            })
          }
        }

        // handle create
        const newObj = {
          type: 'item',
          title: this.title,
          message: this.message,
          labels: newLabels,
          itemContent: this.itemContent
        }
        this.$store.dispatch('updateItemflow', newObj)
        this.isCreated = true
      },
      toggleRightDrawer () {
        let rightDrawer = this.rightDrawer
        this.$store.dispatch('setRightDrawer', !rightDrawer)
      }
    },
    beforeRouteLeave (to, from, next) {
      if (!this.isCreated) {
        this.onCreateItemflow()
        next()
      } else {
        next()
      }
    }
  }
</script>
