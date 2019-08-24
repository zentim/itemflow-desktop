<template>
  <v-flex d-flex xs12>
    <v-toolbar color="white" height="36px" tail flat>
      <v-icon
        style="cursor: pointer; margin: 0 12px"
        :class="isFavorite ? 'orange--text' : ''"
        @click="favorite"
        v-if="!deletedDate"
      >star</v-icon>
      <v-icon
        :class="switchTypeBtnColor"
        style="cursor: pointer; margin: 0 12px"
        @click="switchType"
      >swap_horiz</v-icon>
      <v-icon
        class="purple--text"
        style="cursor: pointer; margin: 0 12px"
        @click="whoOwnMeDialog = !whoOwnMeDialog"
      >assignment</v-icon>
      <v-icon
        style="cursor: pointer; margin: 0 12px"
        class="purple--text"
        @click="graphDialog = !graphDialog"
      >device_hub</v-icon>
      <v-icon
        style="cursor: pointer; margin: 0 12px"
        class="purple--text"
        @click="detailsDialog = !detailsDialog"
      >details</v-icon>
      <v-spacer></v-spacer>
      <v-icon
        style="cursor: pointer; margin: 0 12px"
        v-if="!deletedDate"
        @click="moveToTrash"
      >delete</v-icon>
      <v-icon
        style="cursor: pointer; margin: 0 12px"
        v-if="!!deletedDate"
        @click="moveToTrash"
      >restore_from_trash</v-icon>
    </v-toolbar>

    <!-- details dialog -->
    <template>
      <div class="text-xs-center">
        <v-dialog v-model="detailsDialog" width="500">
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>Details</v-card-title>

            <v-card-text>
              <p>Type: {{ itemflowObj.type }}</p>
              <p>Created: {{ itemflowObj.createdDate }}</p>
              <p>Edited: {{ itemflowObj.editedDate }}</p>
              <p>Favorite: {{ itemflowObj.favorite }}</p>
              <p>Deleted: {{ itemflowObj.deletedDate }}</p>
              <p>ClickRate: {{ itemflowObj.clickRate }}</p>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat @click="detailsDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>

    <!-- whoOwnMe dialog -->
    <template>
      <div class="text-xs-center">
        <v-dialog v-model="whoOwnMeDialog" width="500">
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>whoOwnMe</v-card-title>

            <v-card-text v-if="itemflowObj.whoOwnMe.length === 0">no one own me</v-card-text>

            <v-flex v-for="(obj, index) in itemflowObj.whoOwnMe" :key="index" class="pb-1">
              <itemflow-card
                :id="obj.id"
                :type="obj.type"
                :title="obj.title"
                :message="obj.message"
              ></itemflow-card>
            </v-flex>
            <!-- fix cannot scroll list in small size screen.  -->
            <div class="coverArea hidden-md-and-up"></div>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat @click="whoOwnMeDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>

    <!-- graph dialog -->
    <template>
      <div class="text-xs-center">
        <v-dialog v-model="graphDialog" width="50%">
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>graph</v-card-title>

            <v-card-text v-if="itemflowObj.flowContent.length === 0">no graph</v-card-text>

            <v-flex class="pb-1">
              <graph-area :id="id" :obj="itemflowObj"></graph-area>
            </v-flex>
            <!-- fix cannot scroll list in small size screen.  -->
            <div class="coverArea hidden-md-and-up"></div>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat @click="graphDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>
  </v-flex>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'item'
    },
    isFavorite: Boolean,
    deletedDate: String,
    itemflowObj: {
      type: Object,
      default: () => {
        return {
          type: 'item',
          title: '',
          message: '',
          labels: [],
          labelsFrom: [],
          whoOwnMe: [],
          favorite: false,
          editedDate: '',
          deletedDate: '',
          clickRate: 0,
          itemContent: '',
          flowContent: []
        }
      }
    }
  },
  data () {
    return {
      detailsDialog: false,
      whoOwnMeDialog: false,
      graphDialog: false
    }
  },
  computed: {
    switchTypeBtnColor () {
      return this.type === 'item' ? 'blue--text' : 'green--text'
    }
  },
  methods: {
    switchType () {
      let newType = (this.type === 'item' ? 'flow' : 'item')
      this.$emit('update:type', newType)
    },
    favorite () {
      this.$emit('update:isFavorite', !this.isFavorite)
    },
    moveToTrash () {
      if (this.deletedDate) {
        this.$emit('update:deletedDate', '')
      } else {
        this.$emit('update:deletedDate', new Date().toISOString())
      }
      this.$router.push('/')
    }
  },
  watch: {
    id (newVal) {
      this.whoOwnMeDialog = false
      this.graphDialog = false
    }
  }
}
</script>
