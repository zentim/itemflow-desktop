<template>
  <v-layout row wrap justify-center>
    <!-- loading -->
    <!-- <v-layout row wrap v-if="loading">
      <loading></loading>
    </v-layout> -->

    <!-- <div class="coverArea"></div> -->

    <draggable
      v-model="itemflow"
      class="dragArea "
      :options="{group:{ name:'itemflow',  pull:'clone', put:false }}"
      v-if="!loading">

      <v-flex v-for="(obj, index) in itemflow" :key="index" class="pt-1" style="width: 220px">
        <itemflow-card
          :id="obj.id"
          :type="obj.type"
          :title="obj.title"
          :message="obj.message"></itemflow-card>
      </v-flex>

    </draggable>

    <v-layout align-center v-if="!(loadedItemflow.length < amount)">
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
        // labels: [],
        itemflow: null,
        amount: 120
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      searching () {
        return this.$store.getters.searching
      },
      loadedItemflow () {
        if (this.searching) {
          return this.$store.getters.searchResults
        } else {
          return this.$store.getters.loadedItemflowByAmount(this.amount)
        }
      }
    },
    watch: {
      loadedItemflow (newVal) {
        // this.itemflow = JSON.parse(JSON.stringify(newVal))
        let objs = []
        let len = newVal ? newVal.length : 0
        for (let i = 0; i < len; i++) {
          let obj = {
            id: newVal[i].id,
            type: newVal[i].type,
            title: newVal[i].title,
            message: newVal[i].message
          }
          objs.push(obj)
        }
        this.itemflow = JSON.parse(JSON.stringify(objs))
      }
    }
  }
</script>

<style scoped>
.word-overflow-hidden {
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.coverArea {
  background-color: red;
  width: 100px;
  height: 1000px;
  position: fixed;
  top: 100px;
  right: 0;
  bottom: 0;
  z-index: 100
}
</style>
