<template>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" 
        :width="width+'px'"
        :height="height+'px'"
        @mousemove="drag($event)"
        @mouseup="drop()"
        v-if="bounds.minX">
        
        <line v-for="link in graph.links"
          :x1="coords[link.source.index].x"
          :y1="coords[link.source.index].y"
          :x2="coords[link.target.index].x"
          :y2="coords[link.target.index].y"
          stroke="black" stroke-width="1"/>
        
        <circle v-for="(node, i) in graph.nodes"
          :cx="coords[i].x"
          :cy="coords[i].y"
          :r="10" :fill="node.type==='item' ? '#5FB878' : '#1E9FFF'"
          stroke="white" stroke-width="1"
          @mousedown="currentMove = {x: $event.screenX, y: $event.screenY, node: node}">
          <title>{{ node.title }}</title>
        </circle>
    </svg>
    </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  name: 'graph-area',
  props: {
    id: {
      type: String,
      required: true
    },
    obj: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      graph: {
        nodes: d3.range(100).map(i => ({ index: i, x: null, y: null })),
        links: d3.range(99).map(i => ({ source: Math.floor(Math.sqrt(i)), target: i + 1 }))
      },
      width: 300,
      height: 300,
      padding: 20,
      colors: ['#2196F3', '#E91E63', '#7E57C2', '#009688', '#00BCD4', '#EF6C00', '#4CAF50', '#FF9800', '#F44336', '#CDDC39', '#9C27B0'],
      simulation: null,
      currentMove: null
    }
  },
  computed: {
    bounds () {
      return {
        minX: Math.min(...this.graph.nodes.map(n => n.x)),
        maxX: Math.max(...this.graph.nodes.map(n => n.x)),
        minY: Math.min(...this.graph.nodes.map(n => n.y)),
        maxY: Math.max(...this.graph.nodes.map(n => n.y))
      }
    },
    coords () {
      return this.graph.nodes.map(node => {
        return {
          x: this.padding + (node.x - this.bounds.minX) * (this.width - 2 * this.padding) / (this.bounds.maxX - this.bounds.minX),
          y: this.padding + (node.y - this.bounds.minY) * (this.height - 2 * this.padding) / (this.bounds.maxY - this.bounds.minY)
        }
      })
    }
  },
  mounted () {
    let nodes = [{id: this.id, type: this.obj.type, title: this.obj.title, message: this.obj.message}]
    let links = []
    this.obj.flowContent.map(element => {
      nodes.push(element)
      links.push(element)
    })
    this.graph.nodes = nodes.map((currentValue, index) => {
      return {
        index: index,
        id: currentValue.id,
        type: currentValue.type,
        title: currentValue.title,
        message: currentValue.message,
        x: null,
        y: null
      }
    })
    this.graph.links = links.map((currentValue, index) => {
      return {
        source: 0,
        target: index + 1
      }
    })
    this.simulation = d3.forceSimulation(this.graph.nodes)
      .force('charge', d3.forceManyBody().strength(d => -100))
      .force('link', d3.forceLink(this.graph.links))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
  },
  methods: {
    drag (e) {
      if (this.currentMove) {
        this.currentMove.node.fx = this.currentMove.node.x - (this.currentMove.x - e.screenX) * (this.bounds.maxX - this.bounds.minX) / (this.width - 2 * this.padding)
        this.currentMove.node.fy = this.currentMove.node.y - (this.currentMove.y - e.screenY) * (this.bounds.maxY - this.bounds.minY) / (this.height - 2 * this.padding)
        this.currentMove.x = e.screenX
        this.currentMove.y = e.screenY
      }
    },
    drop () {
      delete this.currentMove.node.fx
      delete this.currentMove.node.fy
      this.currentMove = null
      this.simulation.alpha(1)
      this.simulation.restart()
    }
  }
}
</script>