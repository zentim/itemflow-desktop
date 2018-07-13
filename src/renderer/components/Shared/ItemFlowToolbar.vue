<template>
  <v-layout>
    <v-toolbar color="white" height="40px" tail flat>
      <v-spacer></v-spacer>
      <v-menu left>
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile :class="switchTypeBtnColor" @click="switchType">
            <v-list-tile-title>
              <v-icon :class="switchTypeBtnColor">swap_horiz</v-icon>
              {{ type === 'item' ? 'become Flow' : 'become Item'}}
            </v-list-tile-title>
          </v-list-tile>
          <v-list-tile class="orange--text" @click="favorite" v-if="!deletedDate">
            <v-list-tile-title>
              <v-icon class="orange--text">star</v-icon>
              {{ isFavorite ? 'undo favorite' : 'Favorite'}}
            </v-list-tile-title>
          </v-list-tile>
          <v-list-tile class="purple--text" @click="whoOwnMeDialog = !whoOwnMeDialog">
            <v-list-tile-title>
              <v-icon class="purple--text">assignment</v-icon>
              whoOwnMe
            </v-list-tile-title>
          </v-list-tile>
          <v-list-tile class="purple--text" @click="detailsDialog = !detailsDialog">
            <v-list-tile-title>
              <v-icon class="purple--text">details</v-icon>
              details
            </v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="moveToTrash">
            <v-list-tile-title>
              <v-icon v-if="!deletedDate">delete</v-icon>
              <v-icon v-if="!!deletedDate">restore_from_trash</v-icon>
              {{ deletedDate ? 'restore from trash' : 'move to trash' }}
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>

    <!-- details dialog -->
    <template>
      <div class="text-xs-center">
        <v-dialog
          v-model="detailsDialog"
          width="500"
        >
          <v-card>
            <v-card-title
              class="headline grey lighten-2"
              primary-title
            >
              Details
            </v-card-title>

            <v-card-text>
              <p>Type: {{ itemflowObj.type }}</p>
              <p>Created: {{ itemflowObj.createdDate }}</p>
              <p>Edited: {{ itemflowObj.editedDate }}</p>
              <p>Favorite: {{ itemflowObj.favorite }} </p>
              <p>Deleted: {{ itemflowObj.deletedDate }}</p>
              <p>ClickRate: {{ itemflowObj.clickRate }}</p>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                flat
                @click="detailsDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>

    <!-- whoOwnMe dialog -->
    <template>
      <div class="text-xs-center">
        <v-dialog
          v-model="whoOwnMeDialog"
          width="500"
        >
          <v-card>
            <v-card-title
              class="headline grey lighten-2"
              primary-title
            >
              whoOwnMe
            </v-card-title>

            <v-card-text v-if="Owners.length === 0">
              no one own me
            </v-card-text>

            <v-flex
              v-for="(obj, index) in Owners"
              :key="index"
              class="pb-1">
              <itemflow-card
                :id="obj.id"
                :type="obj.type"
                :title="obj.title"
                :message="obj.message"></itemflow-card>
            </v-flex>
            <!-- fix cannot scroll list in small size screen.  -->
            <div class="coverArea hidden-md-and-up"></div>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                flat
                @click="whoOwnMeDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>
  </v-layout>
</template>

<script>
export default {
  props: ['id', 'type', 'isFavorite', 'isDeleted', 'deletedDate'],
  data () {
    return {
      detailsDialog: false,
      whoOwnMeDialog: false,
      Owners: []
    }
  },
  computed: {
    switchTypeBtnColor () {
      return this.type === 'item' ? 'blue--text' : 'green--text'
    },
    itemflowObj () {
      return this.$store.getters.loadedItemFlowObj(this.id)
    }
  },
  methods: {
    switchType () {
      let type = this.type === 'item' ? 'flow' : 'item'
      this.$emit('update:type', type)
    },
    favorite () {
      this.$emit('update:isFavorite', !this.isFavorite)
    },
    moveToTrash () {
      if (this.deletedDate) {
        this.$emit('update:deletedDate', false)
      } else {
        this.$emit('update:deletedDate', new Date().toISOString())
      }
      this.$router.push('/')
    },
    // for whoOwnMe
    updateLastestData (newVal) {
      let lastestData = []
      let len = newVal ? newVal.length : 0
      for (let i = 0; i < len; i++) {
        // get lastest data
        let obj = this.$store.getters.loadedItemFlowObj(newVal[i].id)
        if (obj) {
          lastestData.push({
            id: obj.id,
            type: obj.type,
            title: obj.title || '',
            message: obj.message || ''
          })
        } else {
          // pass this obj because it not existed in firebase
        }
      }
      return lastestData
    }
  },
  watch: {
    itemflowObj (newVal) {
      this.whoOwnMeDialog = false
      this.Owners = this.updateLastestData(newVal.whoOwnMe)
    }
  }
}
</script>
