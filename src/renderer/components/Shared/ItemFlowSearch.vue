<template>
  <v-text-field
    prepend-icon="search"
    label="Search..."
    solo-inverted
    flat
    v-model="searchInput"
    append-icon="close"
    :append-icon-cb="clearSearchInput"
    @keyup.enter.native="searchItemflow"
  ></v-text-field>
</template>

<script>
export default {
  data () {
    return {
      searchInput: ''
    }
  },
  computed: {
    itemflowStore () {
      return this.$store.getters.itemflowStore.slice()
    },
    searching () {
      return this.$store.getters.searching
    },
    searchKeyword () {
      return this.$store.getters.searchKeyword
    },
    routeName () {
      return this.$route.name
    }
  },
  methods: {
    clearSearchInput () {
      this.searchInput = ''
    },
    searchItemflow () {
      this.$store.commit('setSearchKeyword', this.searchInput)
      this.$store.dispatch('searchItemFlow')
    }
  },
  watch: {
    searchInput (newVal) {
      if (newVal === '') {
        this.searchItemflow()
      }
    },
    searchKeyword (newVal) {
      this.searchInput = newVal
    }
  }
}
</script>
