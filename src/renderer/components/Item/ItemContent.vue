<template>
  <div>
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
import _ from 'lodash'
const OpenCC = require('opencc-js')
const converter = OpenCC.Converter({ from: 'cn', to: 'tw' })
export default {
  name: 'item-content',
  components: { Tinymce },
  props: {
    id: {
      type: String
    },
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
      editerToolbar1: 'formatselect undo redo bold mark hr bullist numlist table codesample removeformat recommend insertEmptyBlock convertContent',
      editerOptions: {}
    }
  },
  created () {
    const that = this
    this.editerOptions = {
      force_br_newlines: true,
      force_p_newlines: false,
      forced_root_block: '',
      height: '100%',
      menubar: false,
      paste_data_images: true,
      codesample_content_css: 'static/plugins/codesample/css/prism.css',
      content_style: `
        .mce-content-body {font-size:11pt;font-family:sans-serif;} 
        .mce-content-body img {max-width:100%;height:auto;} 
        .itemflowLink {
          background-color: rgba(11, 157, 217, 0.075);
          color: #1B6685; 
          border: 1px solid rgba(11, 157, 217, 0.4);
          cursor: pointer;
          padding-right: 3px;
          padding-left: 3px;
        }
        .itemflowLink:hover {background-color: rgba(11, 157, 217, 0.3);}
        `,
      setup: function (editor) {
        editor.addButton('mark', {
          text: 'H',
          icon: false,
          tooltip: 'Hightlight (Ctrl + H)',
          onclick: function () {
            let toggleFormat = function (name, value) {
              editor.formatter.toggle(name, value ? { value: value } : undefined)
              editor.nodeChanged()
            }
            toggleFormat('hilitecolor', 'yellow')
            console.log(editor)
          }
        })

        editor.addButton('recommend', {
          text: 'recommend',
          icon: false,
          tooltip: 'Get a recommend word of content to search',
          onclick: function () {
            that.recommend()
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

        editor.addButton('insertEmptyBlock', {
          text: '插入空白區塊',
          tooltip: 'Insert Empty with <p> tag',
          onClick: function () {
            let text = `
              <p></p>
              <p></p>
              <p></p>
              <hr>
              <p></p>
              <p></p>
              <p></p>
              <p></p>
              <p></p>
              <p></p>
              <hr>
              <p></p>
              <p></p>
              <p></p>
            `
            editor.insertContent(text)
          }
        })

        editor.addButton('convertContent', {
          text: '簡轉繁',
          tooltip: 'convert content',
          onClick: function () {
            that.data = converter(that.data)
          }
        })
      },
      // For item content inner link
      paste_preprocess: function (plugin, args) {
        let draggableItem = that.$store.getters.draggableItem

        if (draggableItem) {
          let id = draggableItem.getElementsByClassName('itemflow')[0].getAttribute('itemflow_id')
          let title = draggableItem.getElementsByClassName('itemflow-title')[0].innerText
          // let message = draggableItem.getElementsByClassName('itemflow-message')[0].innerText
          let linkDOM = ` <span class="itemflowLink" data-id="${id}">${title}</span> `

          args.content = linkDOM
        }
      }
    }
  },
  mounted () {
    this.doresize()
  },
  methods: {
    initCallBack (e) {
      // console.log(this.$refs.tm.editor)
      // console.log('init', e)
      e.setContent(this.data)
      // this.$refs.tm.editor.setContent(this.itemContent)

      // Do resize for tinymce
      this.doresize()

      // For item content inner link
      let that = this
      e.on('click', function (e) {
        if (e.target.className === 'itemflowLink') {
          let id = e.target.getAttribute('data-id')
          that.$router.push({ name: 'Itemflow', params: { id: id } })
        }
      })
    },
    doresize () {
      var ht = document.getElementsByClassName('mce-tinymce')[0].parentNode.offsetHeight

      if (document.getElementsByClassName('mce-tinymce')[0].style.borderWidth) {
        ht += -1
      }

      // console.log('ht = ' + ht)
      if (document.getElementsByClassName('mce-toolbar-grp')) {
        ht += -document.getElementsByClassName('mce-toolbar-grp')[0].offsetHeight
        ht += -document.getElementsByClassName('mce-toolbar-grp')[0].offsetTop
        // console.log('ht = ' + ht)
      }
      if (document.getElementsByClassName('mce-statusbar')) {
        ht += -document.getElementsByClassName('mce-statusbar')[0].offsetHeight
        // console.log('ht = ' + ht)
      }

      ht += -3 // magic value that changes depending on your html and body margins

      if (document.getElementsByClassName('mce-edit-area')) {
        document.getElementsByClassName('mce-edit-area')[0].style.height = ht + 'px'
        // console.log('ht = ' + ht)
      }
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
    id (newVal) {
      this.recommendIndex = 0
      this.recommendResult = []

      if (_.has(this.$refs, 'tm.editor.undoManager')) {
        this.$refs.tm.editor.undoManager.clear()
      }
    },
    itemcontent (newVal) {
      this.data = newVal
    },
    data (newVal) {
      this.$emit('update:itemcontent', newVal)
    }
  }
}
</script>
