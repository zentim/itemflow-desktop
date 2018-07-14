<template>
  <v-text-field
    prepend-icon="search"
    label="Search..."
    solo-inverted
    flat
    v-model="searchInput"
    append-icon="close"
    :append-icon-cb="clearSearchInput"
  ></v-text-field>
</template>

<script>
export default {
  data () {
    return {
      searchInput: ''
    }
  },
  methods: {
    clearSearchInput () {
      this.searchInput = ''
    }
  },
  watch: {
    searchInput (newVal) {
      this.$store.dispatch('searchItemflow', newVal)
    }
  }
}
</script>
