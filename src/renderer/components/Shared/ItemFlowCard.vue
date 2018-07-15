<template>
  <router-link
    :to="'/' + id"
    :key="id"
    tag="span"
    style="cursor: pointer">
    <v-card
      :color="type === 'item' ? 'LogoItemColor' : 'LogoFlowColor'"
      :class="{ selectedCard: isSelected }"
      @mouseover="cardHover = true"
      @mouseleave="cardHover = false">
      <v-btn
        absolute
        fab
        top
        left
        small
        :dark="isSelected"
        @click.native.stop="toggleSelectCard"
        v-show="cardHover || isSelected"
        style="width: 24px; height: 24px; left: -12px; top: -12px;"
        v-if="$route.name !== 'Itemflow'"
      >
        <v-icon>done</v-icon>
      </v-btn>
      <div class="px-2 py-2">
        <div class="itemflow-title word-overflow-hidden">{{ title || 'no title' }}</div>
        <div class="itemflow-message word-overflow-hidden">{{ message || 'no message' }}</div>
      </div>
    </v-card>
  </router-link>
</template>

<script>
  export default {
    props: {
      id: String,
      type: {
        type: String,
        default: 'item'
      },
      title: String,
      message: String,
      selectedList: Array
    },
    data () {
      return {
        cardHover: false,
        isSelected: false
      }
    },
    methods: {
      toggleSelectCard () {
        let newArray = []

        if (this.selectedList.includes(this.id)) {
          for (let i = 0; i < this.selectedList.length; i++) {
            if (this.selectedList[i] !== this.id) {
              newArray.push(this.selectedList[i])
            }
          }
          this.isSelected = false
        } else {
          newArray = this.selectedList
          newArray.push(this.id)
          this.isSelected = true
        }
        this.$emit('update:selectedList', newArray)
      }
    },
    watch: {
      selectedList (newVal) {
        if (!newVal.length) {
          this.isSelected = false
        }
        if (this.selectedList.includes(this.id)) {
          this.isSelected = true
        } else {
          this.isSelected = false
        }
      }
    }
  }
</script>

<style scoped>
.itemflow-title {
  font-size: 18px;
  font-weight: 300;
  color: rgba(0, 0, 0, 0.87);
  line-height: normal;
}
.itemflow-message {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  line-height: normal;
}
.word-overflow-hidden {
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.selectedCard {
  box-shadow: 0 0 0 1px black;
}
</style>
