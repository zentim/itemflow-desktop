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

    <!-- profile information -->
    <v-layout row wrap style="background: linear-gradient(#e66465, #9198e5);">
      <v-flex xs12>
        <template>
          <v-jumbotron dark>
            <v-container fill-height>
              <v-layout align-center>
                <v-flex text-xs-center>
                  <h3 class="display-2">
                    I have
                    <span
                      primary
                      style="font-weight: 600"
                      class="display-3"
                    >{{ itemflowLength }}</span> Itemflow
                  </h3>
                  <h3>
                    Items:
                    <span
                      primary
                      style="color: #004D40; font-weight: 400"
                      class="display-2 px-3"
                    >{{ itemsLength }}</span>
                  </h3>
                  <h3>
                    Flows:
                    <span
                      primary
                      style="color: #01579B; font-weight: 400"
                      class="display-2 px-3"
                    >{{ flowsLength }}</span>
                  </h3>
                  <v-btn color="success" @click="exportData" :disabled="importing">export data</v-btn>
                  <v-btn
                    color="success"
                    @click="importData"
                    :disabled="importing"
                    :loading="importing"
                  >import data</v-btn>
                  <input
                    type="file"
                    id="selectFiles"
                    ref="fileInput"
                    value="Import"
                    style="display: none"
                    @change="onFilePicked"
                  />
                </v-flex>

                <v-flex text-xs-center>
                  <h4>已過 {{ passedPeriods }} 個週期 (7 年為一個週期)</h4>
                  <h3 class="display-2">
                    倒數 <span
                      primary
                      style="font-weight: 600"
                      class="display-3"
                    >{{ countdownDays }}</span> 天
                  </h3>
                  <v-text-field
                    v-model="settings.user.name"
                    label="User Name"
                    box
                  ></v-text-field>
                  <v-text-field
                    v-model="settings.user.birthday"
                    label="Birthday"
                    placeholder="YYYY/MM/DD"
                    box
                  ></v-text-field>
                  <v-btn 
                    color="success" 
                    @click="updateSettings" 
                  >更新設定</v-btn>
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
import _ from 'lodash'
import dayjs from 'dayjs'
import {
  storageSetDataPath,
  storageHas,
  storageGet,
  storageSet
} from '../helper/storageHelper'

export default {
  data () {
    return {
      settings: {
        user: {
          name: '',
          birthday: dayjs().format('YYYY/MM/DD')
        }
      },
      date: new Date().toISOString().substr(0, 10),
    }
  },
  computed: {
    itemflowLength () {
      return this.$store.getters.itemflowStore.filter(obj => {
        return !obj.deletedDate
      }).length
    },
    itemsLength () {
      return this.$store.getters.itemflowStore.filter(obj => {
        return obj.type === 'item' && !obj.deletedDate
      }).length
    },
    flowsLength () {
      return this.$store.getters.itemflowStore.filter(obj => {
        return obj.type === 'flow' && !obj.deletedDate
      }).length
    },
    importing () {
      return this.$store.getters.importing
    },
    loading () {
      return this.$store.getters.loading
    },
    // 已過週期 (7 年為一個週期)
    passedPeriods () {
      if (!_.has(this.settings, 'user.birthday')) {
        return 0
      }

      let count = 0
      const userBirthday = dayjs(this.settings.user.birthday)
      const today = dayjs()
      while (userBirthday.add(count * 7, 'year') < today) {
        count += 1
      }
      return count - 1
    },
    // 倒數天數
    countdownDays () {
      if (!_.has(this.settings, 'user.birthday')) {
        return 0
      }

      let count = 0
      const userBirthday = dayjs(this.settings.user.birthday)
      const today = dayjs()

      // 已過週期 (7 年為一個週期)
      count = 0
      while (userBirthday.add(count * 7, 'year') < today) {
        count += 1
      }
      const passedPeriodsCount = count - 1

      // 7 年一週期的總天數
      const periodTotalDays = 365 * 7

      // 一週期已過天數
      count = 0
      while (userBirthday.add(passedPeriodsCount * 7, 'year').add(count, 'day') < today) {
        count += 1
      }
      const passedDays = count

      // 一週期剩餘天數
      return periodTotalDays - passedDays
    }
  },
  mounted () {
    console.log('mounted')
    this.loadSettings()
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
    },
    // For 載入設定檔
    async loadSettings () {
      storageSetDataPath()
      const hasSettingsFile = await storageHas('settings')
      console.log('hasSettingsFile =>', hasSettingsFile)
      if (hasSettingsFile) {
        const settings = await storageGet('settings')
        this.settings = {
          ...this.settings,
          ...settings,
        }
      }
    },
    // For 更新設定檔
    async updateSettings () {
      storageSetDataPath()
      await storageSet('settings', this.settings)
    }
  }
}
</script>
