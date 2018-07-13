<template>
  <v-layout class="d-flex" style="position: relative">
    <draggable
      v-model="flows"
      class="dragArea"
      :options="{group: 'itemflow'}">
        <v-flex
          v-for="(obj, index) in flows"
          :key="index"
          class="pb-1">
          <div style="position: relative;">
            <div style="position: absolute; top: 10px; right: 0; z-index: 100; cursor: pointer;" >
              <v-icon class="closeCard" large @click.prevent.stop="remove(index)">close</v-icon>
            </div>
          </div>
          <itemflow-card
            :id="obj.id"
            :type="obj.type"
            :title="obj.title"
            :message="obj.message"></itemflow-card>
        </v-flex>
    </draggable>
    <!-- fix cannot scroll list in small size screen.  -->
    <div class="coverArea hidden-md-and-up"></div>
  </v-layout>
</template>


<script>
  export default {
    props: ['content', 'whoOwnMe'],
    data () {
      return {
        flows: [],
        Owners: [],
        model: 'tab-to',
        preventInfiniteLoop: 0 // for develope debug
      }
    },
    methods: {
      remove (index) {
        let removedItemflowId = this.flows[index].id
        this.flows.splice(index, 1)
        this.flows = [...this.flows]

        // remove this from removedItemflow's whoOwnMe
        this.$store.dispatch('removeWhoHaveMe', {
          targetId: removedItemflowId,
          removedObjId: this.$route.params.id
        })
      },
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
    mounted () {
      this.flows = this.updateLastestData(this.content)
      this.Owners = this.updateLastestData(this.whoOwnMe)
    },
    watch: {
      content (newVal) {
        this.model = 'tab-to'
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

        let newContent = this.updateLastestData(newVal)

        // Avoid infinite loop
        let flowsLength = this.flows ? this.flows.length : 0
        let newContentLength = newContent ? newContent.length : 0
        if (flowsLength !== newContentLength) {
          this.flows = newContent || []
        } else {
          for (let i = 0; i < flowsLength; i++) {
            if (this.flows[i].id !== newContent[i].id) {
              this.flows = newContent || []
              return
            }
          }
        }
      },
      flows (newVal) {
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
            let error = 'Can not put into itself!'
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
        this.$emit('update:content', newVal)
      },
      whoOwnMe (newVal) {
        this.Owners = this.updateLastestData(newVal)
      }
    }
  }
</script>

<style scoped>
.dragArea {
  min-height: 300px;
  border: 1px solid #888;
  background-color: #eee;
  /* I don't know why add any value to width can fix card's word overflow problem. */
  width: 0px;
}
.closeCard:hover {
  color: red;
}
.coverArea {
  background-color: rgba(0, 0, 0, 0.1);
  width: 60%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10
}
</style>
