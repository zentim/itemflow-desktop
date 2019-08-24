<template>
  <v-container>
    <!-- loading -->
    <v-layout row wrap v-if="loading">
      <template>
        <div class="text-xs-center">
          <v-dialog v-model="loading" hide-overlay persistent width="300">
            <v-card color="primary" dark>
              <v-card-text>
                Please stand by
                <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-dialog>
        </div>
      </template>
    </v-layout>

    <!-- after log in -->
    <v-layout row wrap>
      <v-flex xs12 sm6 md4 v-for="(obj, index) in itemflow" :key="index" class="pb-1 pr-1">
        <itemflow-card
          :id="obj.id"
          :type="obj.type"
          :title="obj.title"
          :message="obj.message"
          :selectedList.sync="selectedList"
        ></itemflow-card>
      </v-flex>
    </v-layout>
    <v-layout align-center>
      <v-flex xs12 text-xs-center>
        <div
          v-if="itemflow.length && !(itemflow.length < amount) && !searching && routeName === 'Home'"
        >
          <v-btn @click="amount = amount * 2">more</v-btn>
        </div>
      </v-flex>
    </v-layout>

    <template>
      <!-- toolbar -->
      <div class="text-xs-center">
        <v-bottom-sheet
          inset
          :value="selectedList.length > 0"
          :hide-overlay="true"
          :persistent="true"
        >
          <v-card tile>
            <v-list>
              <v-list-tile>
                <v-list-tile-action>
                  <v-btn icon @click="clearAllSelected">
                    <v-icon>arrow_back</v-icon>
                  </v-btn>
                </v-list-tile-action>

                <v-list-tile-content>
                  <v-list-tile-title>{{ selectedList.length }} selected</v-list-tile-title>
                </v-list-tile-content>

                <v-spacer></v-spacer>

                <v-list-tile-action>
                  <v-btn @click="selectAll">Select All</v-btn>
                </v-list-tile-action>

                <v-list-tile-action>
                  <v-btn @click="exportSelected">Export</v-btn>
                </v-list-tile-action>

                <v-list-tile-action
                  :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }"
                  v-if="this.$route.name !== 'Trash'"
                >
                  <v-btn icon @click="moveToTrashSeleted">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </v-list-tile-action>

                <v-list-tile-action
                  :class="{ 'mr-3': $vuetify.breakpoint.mdAndUp }"
                  v-if="this.$route.name === 'Trash'"
                >
                  <v-btn icon @click="restoreFromTrashSeleted">
                    <v-icon>restore_from_trash</v-icon>
                  </v-btn>
                </v-list-tile-action>

                <v-list-tile-action
                  :class="{ 'mr-3': $vuetify.breakpoint.mdAndUp }"
                  v-if="this.$route.name === 'Trash'"
                >
                  <v-btn icon dark color="red" @click.stop="dialog = true">
                    <v-icon>delete_forever</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-bottom-sheet>
      </div>

      <template>
        <!-- delete forever dialog -->
        <v-layout row justify-center>
          <v-dialog v-model="dialog" max-width="290">
            <v-card>
              <v-card-title class="headline">Delete Forever?</v-card-title>

              <v-card-text>{{ selectedList.length }} selected</v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn color="red darken-1" flat="flat" @click="removeForeverSeleted">Delete Forever</v-btn>

                <v-btn flat="flat" @click="dialog = false">NO</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>
      </template>
    </template>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      amount: 40,
      selectedList: [],
      dialog: false
    }
  },
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    searching () {
      return this.$store.getters.searching
    },
    routeName () {
      return this.$route.name
    },
    itemflow () {
      this.selectedList = []
      this.$store.commit('sortItemflowStore')

      if (this.routeName === 'Favorite') {
        return this.$store.getters.itemflowStore.filter(obj => obj.favorite && !obj.deletedDate)
      }

      if (this.routeName === 'Trash') {
        return this.$store.getters.itemflowStore.filter(obj => obj.deletedDate)
      }

      if (this.routeName === 'Home' && this.searching) {
        return this.$store.getters.searchResults
      }

      let lastTrashNum = 0
      let trashNum = this.$store.getters.itemflowStoreByAmount(this.amount).filter(obj => obj.deletedDate).length
      while (lastTrashNum !== trashNum) {
        lastTrashNum = trashNum
        trashNum = this.$store.getters.itemflowStoreByAmount(this.amount + trashNum).filter(obj => obj.deletedDate).length
      }

      return this.$store.getters.itemflowStoreByAmount(this.amount + trashNum).filter(obj => !obj.deletedDate)
    }
  },
  methods: {
    clearAllSelected () {
      this.selectedList = []
    },
    selectAll () {
      let newArr = []
      for (let i = 0; i < this.itemflow.length; i++) {
        newArr.push(this.itemflow[i].id)
      }
      this.selectedList = newArr
    },
    exportSelected () {
      this.$store.dispatch('exportSelectedData', this.selectedList)
    },
    moveToTrashSeleted () {
      for (let i = 0; i < this.selectedList.length; i++) {
        let obj = this.$store.getters.itemflowStoreObj(this.selectedList[i])
        if (obj === undefined || Object.getOwnPropertyNames(obj).length === 0) {
          console.log('Alert: can not find ' + this.selectedList[i] + ', get undefined')
          continue
        }
        obj.deletedDate = new Date().toISOString()
        this.$store.dispatch('updateItemflow', obj)
      }
      this.$store.commit('sortItemflowStore')
      if (this.searching) {
        this.$store.dispatch('searchItemFlow')
      }
      // output
      this.$store.dispatch('outputItemflowStore')
    },
    restoreFromTrashSeleted () {
      for (let i = 0; i < this.selectedList.length; i++) {
        let obj = this.$store.getters.itemflowStoreObj(this.selectedList[i])
        if (obj === undefined || Object.getOwnPropertyNames(obj).length === 0) {
          console.log('Alert: can not find ' + this.selectedList[i] + ', get undefined')
          continue
        }
        obj.deletedDate = ''
        this.$store.dispatch('updateItemflow', obj)
      }
      this.$store.commit('sortItemflowStore')
      if (this.searching) {
        this.$store.dispatch('searchItemFlow')
      }
      // output
      this.$store.dispatch('outputItemflowStore')
    },
    removeForeverSeleted () {
      /**
       * TODO: 把被刪除的資料分開到另一個檔案放
       */
      for (let i = 0; i < this.selectedList.length; i++) {
        this.$store.dispatch('removeItemflow', { 'id': this.selectedList[i] })
      }
      this.dialog = false
      if (this.searching) {
        this.$store.dispatch('searchItemFlow')
      }
      // output
      this.$store.dispatch('outputItemflowStore')
    }
  }
}
</script>

<style scoped>
.word-overflow-hidden {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
