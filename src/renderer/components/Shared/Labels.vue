<template>
  <v-layout>
    <v-flex>
      <v-tabs
        dark
        color="cyan"
        centered
        v-model="model"
      >
        <v-tabs-slider color="yellow"></v-tabs-slider>
        <v-tab
          key="tab-from"
          href="#tab-from">
          From
        </v-tab>
        <v-tab
          key="tab-to"
          href="#tab-to"
        >
          To
        </v-tab>
        <v-tabs-items v-model="model">
          <v-tab-item
            id="tab-from">
            <div style="min-height: 120px;border-bottom: 1px solid #ccc;background-color: #fff;">
              <v-card flat style="min-height: 120px;border-bottom: 1px solid #ccc;background-color: #fff;">
              <!-- labels -->
              <div v-for="(obj) in chipsFrom" :key="obj.id" style="display: inline">
                <v-chip
                  :color="itemflowColor(obj.type)"
                  :key="obj.id">
                  <router-link
                    :to="'/'+ obj.id"
                    tag="span"
                    style="cursor: pointer"
                    :key="obj.id">
                    {{ handleText(obj.title) || 'no title' }}
                  </router-link>
                </v-chip>
              </div>
            </v-card>
            </div>
            
          </v-tab-item>

          <v-tab-item
            id="tab-to"
          >
            <div style="min-height: 120px;border-bottom: 1px solid #ccc;background-color: #fff;">
              <v-card flat>
                <!-- drag area -->
                <draggable
                  v-model="chips"
                  class="dragArea"
                  :options="{group: 'itemflow'}"
                  >
                  <!-- labels -->
                  <div v-for="(obj, index) in chips" :key="index" style="display: inline">

                    <v-chip
                      close
                      :color="itemflowColor(obj.type)"
                      @input="remove(index)"
                      :key="index">
                      <router-link
                        :to="'/' + obj.id"
                        tag="span"
                        style="cursor: pointer"
                        :key="obj.id">
                        {{ handleText(obj.title) || 'no title' }}
                      </router-link>
                    </v-chip>
                  </div>
                </draggable>
            </v-card>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>


<script>
  export default {
    props: {
      labels: {
        type: Array,
        default: () => []
      },
      labelsFrom: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        chips: [
          // {
          //   id: '',
          //   type: '',
          //   title: '',
          //   message: ''
          // }
        ],
        chipsFrom: [],
        model: 'tab-to'
      }
    },
    methods: {
      handleText (text) {
        let maxLength = 23
        let textLength = text ? text.length : 0
        if (textLength > maxLength) {
          return text.slice(0, maxLength - 3) + '...'
        }
        return text
      },
      remove (index) {
        this.chips.splice(index, 1)
      },
      itemflowColor (type) {
        if (type === 'item') {
          return 'LogoItemColor'
        } else if (type === 'flow') {
          return 'LogoFlowColor'
        }
      }
    },
    mounted () {
      this.$nextTick(function () {
        // Code that will run only after the
        // entire view has been rendered
        this.chips = this.labels
        this.chipsFrom = this.labelsFrom
      })
    },
    watch: {
      labels (newVal) {
        this.chips = newVal
      },
      chips (newVal) {
        // prevent from adding same labels or itself
        for (let i = 0; i < newVal.length; i++) {
          if (newVal[i].id === this.$route.params.id) {
            let error = 'Can not put itself into labels!'
            this.$store.dispatch('setErrorText', error)
            this.remove(i)
            return
          }
          for (let j = i + 1; j < newVal.length; j++) {
            if (newVal[i].id === newVal[j].id) {
              let error = 'Aready has this label!'
              this.$store.dispatch('setErrorText', error)
              this.remove(j)
              return
            }
          }
        }

        // update data to parent component
        this.$emit('update:labels', newVal)
      },
      labelsFrom (newVal) {
        this.chipsFrom = newVal
      }
    }
  }
</script>

<style scoped>
.dragArea {
  min-height: 120px;
  border-bottom: 1px solid #ccc;
  background-color: #fff;
}
</style>
