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
        color="secondary"
        app
        dense
      >
        <div class="ml-1 hidden-md-and-down mx-0 px-0" v-if="$route.name === 'Home'">
          <v-icon large class="mx-0 px-0">home</v-icon>
        </div>
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

        <!-- Search -->
        <v-spacer class="hidden-md-and-down"></v-spacer>
        <app-search class="mx-1"></app-search>
        <v-spacer class="hidden-md-and-down"></v-spacer>

        <v-icon class="hidden-lg-and-up mx-1" large style="cursor: pointer" @click.stop="rightDrawer = !rightDrawer">chrome_reader_mode</v-icon>
      </v-toolbar>

      <!-- main -->
      <v-content style="background-color: #ececec">
        <router-view></router-view>
      </v-content>

      <!-- right -->
      <!-- z-index is fixing flow content delete show problem in small size screen.  -->
      <v-navigation-drawer
        fixed
        right
        :value="rightDrawer"
        :hide-overlay="rightDrawer"
        width="250"
        style="z-index: 200"
        v-show="this.$route.name !== 'Home'"
      >
        <div style="position: relative">
          <v-icon class="hidden-lg-and-up px-2 py-2" style="cursor: pointer" large @click.stop="rightDrawer = !rightDrawer">keyboard_tab</v-icon>
          <v-card class="hidden-lg-and-up" color="secondary" flat>
            <app-search></app-search>
          </v-card>
          <right-drawer-content></right-drawer-content>
          <!-- fix cannot scroll list in small size screen.  -->
          <div class="coverArea hidden-md-and-up"></div>
        </div>
      </v-navigation-drawer>
    </v-app>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        drawer: true,
        rightDrawer: null,
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
      }
    },
    methods: {
      goto () {
        if (this.$route.name === 'Itemflow') {
          this.$router.go(-1)
        } else {
          this.$router.push('/')
        }
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
