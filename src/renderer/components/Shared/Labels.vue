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
            <v-card flat>
              <!-- labels -->
              <div v-for="(obj, index) in chipsFrom" :key="`index + 1000`" style="display: inline">
                <v-chip
                  :color="itemflowColor(obj.type)"
                  :key="`index + 1000`">
                  <router-link
                    :to="'/'+ obj.id"
                    tag="span"
                    style="cursor: pointer"
                    :key="`obj.id + from`">
                    {{ handleText(obj.title) || 'no title' }}
                  </router-link>
                </v-chip>
              </div>
            </v-card>
          </v-tab-item>

          <v-tab-item
            id="tab-to"
          >
            <v-card flat>
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
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>


<script>
  export default {
    props: ['labels', 'labelsFrom'],
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
        preventInfiniteLoop: 0, // for develope debug
        model: 'tab-to'
      }
    },
    methods: {
      handleText (text) {
        let maxLength = 30
        let textLength = text ? text.length : 0
        if (textLength > maxLength) {
          return text.slice(0, maxLength - 3) + '...'
        }
        return text
      },
      remove (index) {
        let removedChipId = this.chips[index].id
        this.chips.splice(index, 1)
        this.chips = [...this.chips]

        // remove this from removedChip's labelsFrom
        this.$store.dispatch('removeLabelsFrom', {
          targetId: removedChipId,
          removedObjId: this.$route.params.id
        })
      },
      itemflowColor (type) {
        if (type === 'item') {
          return 'LogoItemColor'
        } else if (type === 'flow') {
          return 'LogoFlowColor'
        }
      },
      updateLastestData (newVal) {
        let lastestData = []
        let len = newVal ? newVal.length : 0
        for (let i = 0; i < len; i++) {
          // get lastest data
          let obj = this.$store.getters.loadedItemflowObj(newVal[i].id)
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
    mounted () {
      this.chips = this.updateLastestData(this.labels)
      this.chipsFrom = this.updateLastestData(this.labelsFrom)
    },
    watch: {
      labels (newVal) {
        // for develope debug
        if (this.preventInfiniteLoop > 50) {
          console.log('Error: Infinite Loop!')
          return
        } else {
          this.preventInfiniteLoop++
        }

        // Avoid cannot read property 'lenght' of undefined
        if (!newVal) {
          newVal = []
        }

        let newLabels = this.updateLastestData(newVal)

        // Avoid infinite loop
        let chipsLength = this.chips ? this.chips.length : 0
        let newLabelsLenght = newLabels ? newLabels.length : 0
        if (chipsLength !== newLabelsLenght) {
          this.chips = newLabels || []
        }
      },
      chips (newVal) {
        // for develope debug
        if (this.preventInfiniteLoop > 50) {
          console.log('Error: Infinite Loop!')
          return
        } else {
          this.preventInfiniteLoop++
        }

        // Avoid cannot read property 'lenght' of undefined
        if (!newVal) {
          newVal = []
        }

        // remove same label
        let len = newVal ? newVal.length : 0
        for (let i = 0; i < len; i++) {
          if (newVal[i].id === this.$route.params.id) {
            let error = 'Can not put itself into Labels!'
            this.$store.dispatch('setErrorText', error)
            this.remove(i)
            return
          }
          for (let j = i + 1; j < len; j++) {
            if (newVal[i].id === newVal[j].id) {
              let error = 'Aready had!'
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
        this.chipsFrom = this.updateLastestData(newVal)
      }
    }
  }
</script>

<style scoped>
.dragArea {
  min-height: 120px;
  border: 1px solid #888;
  background-color: #eee;
}
</style>
