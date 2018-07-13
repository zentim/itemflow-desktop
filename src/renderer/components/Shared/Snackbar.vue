<template>

    <v-snackbar
      :timeout="timeout"
      :top="y === 'top'"
      :bottom="y === 'bottom'"
      :right="x === 'right'"
      :left="x === 'left'"
      :multi-line="mode === 'multi-line'"
      :vertical="mode === 'vertical'"
      v-model="snackbar"
    >
      {{ errorText }}
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>

</template>

<script>
  export default {
    data () {
      return {
        snackbar: false,
        y: 'top',
        x: null,
        mode: 'multi-line',
        timeout: 6000
      }
    },
    computed: {
      errorText () {
        return this.$store.getters.errorText
      }
    },
    watch: {
      errorText (newVal) {
        this.snackbar = true
      }
    }
  }
</script>
