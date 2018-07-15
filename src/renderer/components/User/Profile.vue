<template>
  <v-container>
    <!-- loading -->
    <v-layout row wrap v-if="loading">
      <template>
        <div class="text-xs-center">
          <v-dialog
            v-model="loading"
            hide-overlay
            persistent
            width="300"
          >
            <v-card
              color="primary"
              dark
            >
              <v-card-text>
                Please stand by
                <v-progress-linear
                  indeterminate
                  color="white"
                  class="mb-0"
                ></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-dialog>
        </div>
      </template>
    </v-layout>

    <!-- profile information -->
    <v-layout row wrap style="background: linear-gradient(#e66465, #9198e5);">
      <v-flex xs12>
        <template>
          <v-jumbotron dark>
            <v-container fill-height>
              <v-layout align-center>
                <v-flex text-xs-center>
                  <h3 class="display-2">I have <span primary style="font-weight: 600" class="display-3">{{ itemflowLength }}</span> Itemflow</h3>
                  <h3 >Items: <span primary style="color: #004D40; font-weight: 400" class="display-2 px-3">{{ itemsLength }}</span></h3>
                  <h3 >Flows: <span primary style="color: #01579B; font-weight: 400" class="display-2 px-3">{{ flowsLength }}</span></h3>
                  <v-btn color="success" @click="exportData" :disabled="importing">export data</v-btn>
                  <v-btn color="success" @click="importData" :disabled="importing" :loading="importing">import data</v-btn>
                  <input type="file" id="selectFiles" ref="fileInput" value="Import" style="display: none" @change="onFilePicked"/>
                </v-flex>
              </v-layout>
            </v-container>
          </v-jumbotron>
        </template>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    computed: {
      itemflowLength () {
        let itemflow = this.$store.getters.itemflowStore
        let length = itemflow ? itemflow.length : 0
        return length
      },
      itemsLength () {
        let itemflow = this.$store.getters.loadedItems
        let length = itemflow ? itemflow.length : 0
        return length
      },
      flowsLength () {
        let itemflow = this.$store.getters.loadedFlows
        let length = itemflow ? itemflow.length : 0
        return length
      },
      importing () {
        return this.$store.getters.importing
      },
      loading () {
        return this.$store.getters.loading
      }
    },
    methods: {
      exportData () {
        this.$store.dispatch('exportData')
      },
      importData () {
        this.$refs.fileInput.click()
      },
      onFilePicked (event) {
        const files = event.target.files
        let filename = files[0].name
        if (filename.lastIndexOf('.') <= 0) {
          return alert('Please add a valid file!')
        }

        let fr = new FileReader()
        fr.addEventListener('load', (e) => {
          try {
            let result = JSON.parse(e.target.result)
            this.$store.dispatch('importData', result)
          } catch (error) {
            this.$store.dispatch('clearError')
            this.$store.dispatch('setErrorText', error.toString())
          }
        })
        fr.readAsText(files.item(0))
      }
    }
  }
</script>
