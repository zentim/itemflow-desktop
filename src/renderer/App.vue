<template>
  <div id="app">
    <!-- snackbar -->
    <app-snackbar></app-snackbar>

    <v-app>
      <!-- left -->
      <v-navigation-drawer
        fixed
        :mini-variant="mini"
        light
        class="secondary"
        v-model="drawer"
        app
        style="z-index: 1000"
      >
        <v-list class="my-5 py-5">
          <v-list-tile
            v-for="item in menuItemsTop"
            :key="item.title"
            :to="item.link">
            <v-list-tile-action>
              <v-tooltip right>
                <v-icon large slot="activator">{{ item.icon }}</v-icon>
                <span>{{ item.title }}</span>
              </v-tooltip>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>

        <v-list class="my-5 py-5">
          <v-list-tile
            v-for="item in menuItemsMiddle"
            :key="item.title"
            :to="item.link">
            <v-list-tile-action>
              <v-tooltip right>
                <v-icon large slot="activator">{{ item.icon }}</v-icon>
                <span>{{ item.title }}</span>
              </v-tooltip>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>

      <!-- nav -->
      <v-toolbar
        light
        fixed
        flat
        clipped-right
        color="secondary"
        app
        dense
      >
        <div class="ml-1 hidden-lg-and-up" v-if="$route.name === 'Home'">
          <v-toolbar-side-icon class="mx-0 px-0" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        </div>
        <div class="ml-1" v-else>
          <v-icon large color="primary" style="cursor: pointer" @click="goto">arrow_back</v-icon>
        </div>
        <!-- nav - logo -->
        <div class="mx-1">
          <router-link to="/" tag="span" style="cursor: pointer" class="title">
            Itemflow
          </router-link>
        </div>

        <!-- RightDrawerController -->
        <v-spacer v-show="$route.name === 'Itemflow' || $route.name === 'New'"></v-spacer>
        <v-icon 
          class="mx-1" 
          large 
          style="cursor: pointer"
          @click.stop="toggleRightDrawer"
          v-show="$route.name === 'Itemflow' || $route.name === 'New'"
        >
          chrome_reader_mode
        </v-icon>

        <!-- Search -->
        <div :style="$route.name === 'Itemflow' || $route.name === 'New' ? 'width: 250px; margin-right: 0px' : 'width: 100%; margin-right: 0px'" v-show="rightDrawer || $route.name !== 'Itemflow'">
          <app-search></app-search>
        </div>
        
      </v-toolbar>

      <!-- main -->
      <!-- <v-content style="background-color: #ececec"> -->
      <v-content style="background-color: #fff">
        <router-view></router-view>
      </v-content>

    </v-app>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        drawer: true,
        mini: true
      }
    },
    computed: {
      menuItemsTop () {
        return [
          { icon: 'add', title: 'Add Item', link: '/new' }
        ]
      },
      menuItemsMiddle () {
        return [
          { icon: 'home', title: 'Home', link: '/' },
          { icon: 'star', title: 'Favorite', link: '/favorite' },
          { icon: 'account_box', title: 'Profile', link: '/profile' },
          { icon: 'delete', title: 'Trash', link: '/trash' }
        ]
      },
      rightDrawer () {
        return this.$store.getters.rightDrawer
      }
    },
    methods: {
      goto () {
        if (this.$route.name === 'Itemflow') {
          this.$router.go(-1)
        } else {
          this.$router.push('/')
        }
      },
      toggleRightDrawer () {
        let rightDrawer = this.rightDrawer
        this.$store.dispatch('setRightDrawer', !rightDrawer)
      }
    }
  }
</script>
<style scoped>
.coverArea {
  background-color: rgba(0, 0, 0, 0.1);
  width: 60%;
  height: 100%;
  position: absolute;
  top: 100px;
  right: 0;
  z-index: 10
}
</style>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  /* Global CSS */
</style>
