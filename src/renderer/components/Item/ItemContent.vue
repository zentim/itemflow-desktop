<template>
  <v-card flat>
    <div>
      <tinymce
        id="d1"
        v-model="data"
        v-on:editorInit="initCallBack"
        ref="tm"
        :htmlClass="editerHtmlClass"
        :plugins="editerPlugins"
        :toolbar1="editerToolbar1"
        :other_options="editerOptions"></tinymce>
    </div>
  </v-card>
</template>

<script>
  import Tinymce from './TinymceVue'
  export default {
    name: 'item-content',
    components: { Tinymce },
    props: {
      itemcontent: String
    },
    data () {
      return {
        data: this.content,
        editerHtmlClass: '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
        editerPlugins: [
          'autolink lists link image charmap print preview hr anchor pagebreak',
          'searchreplace wordcount visualchars code fullscreen',
          'insertdatetime media nonbreaking save table',
          'template paste textcolor colorpicker textpattern imagetools toc emoticons hr codesample'
        ],
        editerToolbar1: 'undo redo bold mark hr bullist numlist table codesample removeformat ',
        editerOptions: {
          height: 520,
          menubar: false,
          content_style: '.mce-content-body {font-size:10pt;font-family:sans-serif;} p{-webkit-margin-before: 0px;-webkit-margin-after: 0px}',
          setup: function (editor) {
            editor.addButton('mark', {
              text: 'H',
              icon: false,
              onclick: function () {
                var toggleFormat = function (name, value) {
                  editor.formatter.toggle(name, value ? { value: value } : undefined)
                  editor.nodeChanged()
                }
                toggleFormat('hilitecolor', 'yellow')
              }
            })
          }
        }
      }
    },
    methods: {
      initCallBack (e) {
        // console.log(this.$refs.tm.editor)
        // console.log('init', e)
        e.setContent(this.data)
        // this.$refs.tm.editor.setContent(this.itemContent)
      }
    },
    watch: {
      content (newVal) {
        this.data = newVal
      },
      data (newVal) {
        this.$emit('update:content', newVal)
      }
    }
  }
</script>
