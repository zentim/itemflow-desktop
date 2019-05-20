<template>
  <div>
    <v-btn outline block large color="indigo" @click="recommend">recommend</v-btn>
    <tinymce
      id="d1"
      v-model="data"
      v-on:editorInit="initCallBack"
      ref="tm"
      :htmlClass="editerHtmlClass"
      :plugins="editerPlugins"
      :toolbar1="editerToolbar1"
      :other_options="editerOptions"
    ></tinymce>
  </div>
</template>

<script>
import Tinymce from './TinymceVue'
import { Segment, useDefault } from 'segmentit'
import stopwords from './stopwords/stopwords'
export default {
  name: 'item-content',
  components: { Tinymce },
  props: {
    itemcontent: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      recommendIndex: 0,
      recommendResult: [],
      data: this.itemcontent,
      editerHtmlClass: '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
      editerPlugins: [
        'autolink lists link image charmap print preview hr anchor pagebreak',
        'searchreplace wordcount visualchars code fullscreen',
        'insertdatetime media nonbreaking save table',
        'template paste textcolor colorpicker textpattern imagetools toc emoticons hr codesample'
      ],
      editerToolbar1: 'undo redo bold mark hr bullist numlist table codesample removeformat recommed',
      editerOptions: {
        height: 550,
        menubar: false,
        paste_data_images: true,
        codesample_content_css: 'static/plugins/codesample/css/prism.css',
        content_style: '.mce-content-body {font-size:10pt;font-family:sans-serif;} .mce-content-body img {max-width:100%;height:auto;} p{-webkit-margin-before: 0px;-webkit-margin-after: 0px;}',
        setup: function (editor) {
          editor.addButton('mark', {
            text: 'H',
            icon: false,
            onclick: function () {
              let toggleFormat = function (name, value) {
                editor.formatter.toggle(name, value ? { value: value } : undefined)
                editor.nodeChanged()
              }
              toggleFormat('hilitecolor', 'yellow')
              console.log(editor)
            }
          })

          editor.shortcuts.add('ctrl+h', 'To highlight', function () {
            let toggleFormat = function (name, value) {
              editor.formatter.toggle(name, value ? { value: value } : undefined)
              editor.nodeChanged()
            }
            toggleFormat('hilitecolor', 'yellow')
            console.log(editor)
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
    },
    recommend () {
      if (this.recommendResult.length === 0) {
        const content = this.$refs.tm.editor.getContent({ format: 'text' })
        const segmentit = useDefault(new Segment())
        const segmentWords = segmentit.doSegment(content)
        let _result = []
        segmentWords.map(data => {
          _result.push(data.w)
        })
        _result = this._filter_stop_words(_result)
        let afterWordCount = this.count_words(_result)
        let transformWordCount = Object.keys(afterWordCount).map(word => {
          return {
            word: word,
            count: afterWordCount[word]
          }
        })
        let afterSort = transformWordCount.sort((a, b) => {
          return b.count - a.count
        })
        let result = afterSort.slice(0, 10)
        this.recommendResult = result
        console.log(result)
      }
      if (this.recommendResult.length !== 0) {
        console.log(this.recommendIndex)
        this.$store.commit('setSearchKeyword', this.recommendResult[this.recommendIndex].word)
        this.$store.dispatch('searchItemFlow')
        this.recommendIndex = (this.recommendIndex + 1) % (this.recommendResult.length)
      }
    },
    _filter_stop_words (_result) {
      let _stopwords = stopwords

      for (let _s in _stopwords) {
        _stopwords[_s] = _stopwords[_s].trim()
      }

      let _output = []
      for (let _r in _result) {
        let _word = _result[_r].trim()
        if (_stopwords.indexOf(_word) === -1) {
          _output.push(_word)
        }
      }
      return _output
    },
    count_words (arr) {
      return arr.reduce(function (count, word) {
        if (word.trim()) {
          count[word] = count.hasOwnProperty(word) ? count[word] + 1 : 1
        }
        return count
      }, {})
    }
  },
  watch: {
    itemcontent (newVal) {
      this.data = newVal
      this.recommendIndex = 0
      this.recommendResult = []
    },
    data (newVal) {
      this.$emit('update:itemcontent', newVal)
    }
  }
}
</script>
