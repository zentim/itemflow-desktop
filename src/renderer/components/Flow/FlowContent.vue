<template>
  <div>
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
  </div>
</template>


<script>
  export default {
    props: {
      flowcontent: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        flows: [
        // {
        //   id: '',
        //   type: '',
        //   title: '',
        //   message: ''
        // }
        ],
        model: 'tab-to'
      }
    },
    methods: {
      remove (index) {
        this.flows.splice(index, 1)
      }
    },
    mounted () {
      this.$nextTick(function () {
        this.flows = this.flowcontent
      })
    },
    watch: {
      flowcontent (newVal) {
        // revert it when change itemflow but component does not re-render
        this.model = 'tab-to'

        // Avoid cannot read property 'lenght' of undefined
        if (!newVal) {
          newVal = []
        }

        this.flows = newVal
      },
      flows (newVal) {
        // prevent from adding same itemflow or itself
        for (let i = 0; i < newVal.length; i++) {
          if (newVal[i].id === this.$route.params.id) {
            let error = 'Can not put into itself into flow content!'
            this.$store.dispatch('setErrorText', error)
            this.remove(i)
            return
          }
          for (let j = i + 1; j < newVal.length; j++) {
            if (newVal[i].id === newVal[j].id) {
              let error = 'Already existed in the flow content!'
              this.$store.dispatch('setErrorText', error)
              this.remove(j)
              return
            }
          }
        }

        // update data to parent component
        this.$emit('update:flowcontent', newVal)
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
