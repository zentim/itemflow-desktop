<template>
  <v-layout>
    <v-layout row wrap>
      <v-flex xs12 md4>
        <v-card class="pt-3" flat>
          <item-flow-outline
            :id="id"
            :title.sync="title"
            :message.sync="message"
            :labels.sync="labels"></item-flow-outline>
        </v-card>
      </v-flex>

      <v-flex xs12 md8>
        <item-content :content.sync="itemContent"></item-content>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
  export default {
    data () {
      return {
        id: 'new',
        title: '',
        message: '',
        itemContent: '',
        flowContent: [],
        labels: [],
        isCreated: false
      }
    },
    computed: {
      isEmpty () {
        return !this.title && !this.message && !this.itemContent && this.labels.length === 0
      }
    },
    methods: {
      onCreateItemflow () {
        if (this.isEmpty) {
          return
        }
        // handle labels
        let labels = this.labels
        let labelsLength = labels ? labels.length : 0
        let newLabels = []
        for (let i = 0; i < labelsLength; i++) {
          newLabels.push({
            id: labels[i].id,
            type: labels[i].type,
            title: labels[i].title,
            message: labels[i].message
          })
        }

        // handle create
        const newObj = {
          type: 'item',
          title: this.title,
          message: this.message,
          labels: newLabels || [],
          itemContent: this.itemContent,
          flowContent: []
        }
        this.$store.dispatch('createItemflow', newObj)
        this.isCreated = true
      }
    },
    beforeRouteLeave (to, from, next) {
      if (!this.isCreated) {
        this.onCreateItemflow()
        next()
      } else {
        next()
      }
    }
  }
</script>
