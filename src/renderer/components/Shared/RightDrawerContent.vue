<template>
  <v-layout row wrap justify-center>
    <draggable
      v-model="itemflowStore"
      class="dragArea"
      :options="{group:{ name:'itemflow',  pull:'clone', put:false }}"
      @start="draggableOnStart"
      @end="draggableOnEnd"
      v-if="!loading"
    >
      <v-flex v-for="(obj, index) in itemflowStore" :key="index" class="pt-1" style="width: 220px">
        <itemflow-card :id="obj.id" :type="obj.type" :title="obj.title" :message="obj.message"></itemflow-card>
      </v-flex>
    </draggable>

    <v-layout align-center v-if="!(itemflowStore.length < amount)">
      <v-flex xs12 text-xs-center>
        <div>
          <v-btn @click="amount = amount * 2">more</v-btn>
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>


<script>
export default {
  data () {
    return {
      amount: 40
    }
  },
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    searching () {
      return this.$store.getters.searching
    },
    itemflowStore () {
      if (this.searching) {
        return this.$store.getters.searchResults
      } else {
        let lastTrashNum = 0
        let trashNum = this.$store.getters.itemflowStoreByAmount(this.amount).filter(obj => obj.deletedDate).length
        while (lastTrashNum !== trashNum) {
          lastTrashNum = trashNum
          trashNum = this.$store.getters.itemflowStoreByAmount(this.amount + trashNum).filter(obj => obj.deletedDate).length
        }

        return this.$store.getters.itemflowStoreByAmount(this.amount + trashNum).filter(obj => !obj.deletedDate)
      }
    }
  },
  methods: {
    draggableOnStart (event) {
      this.$store.dispatch('setDraggableItem', event.item)
    },
    draggableOnEnd (event) {
      setTimeout(() => {
        this.$store.dispatch('setDraggableItem', null)
      }, 300)
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
.coverArea {
  background-color: red;
  width: 100px;
  height: 1000px;
  position: fixed;
  top: 100px;
  right: 0;
  bottom: 0;
  z-index: 100;
}
</style>
