<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import LoginView from './views/login/LoginView.vue'
import { mapState } from 'vuex'
import { ref } from 'vue'
export default {
  setup() {
    const theme = ref('dark')
    function changeTheme() {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }
    return { theme, changeTheme }
  },
  name: 'App',
  components: {
    LoginView,
    RouterLink,
    RouterView,
  },
  computed: mapState({
    authUser() {
      return this.$store.state.auth.user
    },
    isAuthenticated() {
      // Check directly from localStorage as a fallback
      const storedUser = localStorage.getItem('user')
      let user = null

      try {
        if (storedUser) {
          user = JSON.parse(storedUser)
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e)
      }

      const storeAuth =
        this.$store.state.auth.status.loggedIn &&
        this.authUser &&
        typeof this.authUser === 'object' &&
        'token' in this.authUser

      const localAuth = user && typeof user === 'object' && 'token' in user

      return storeAuth || localAuth
    },
    title() {
      return this.authUser && this.authUser.name ? 'Welcome ' + this.authUser.name + '!' : ''
    },
    userInitials() {
      if (!this.authUser || !this.authUser.name) {
        return this.authUser && this.authUser.email ? this.authUser.email[0].toUpperCase() : '?'
      }
      const nameParts = this.authUser.name.split(' ')
      if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      } else {
        return nameParts[0][0].toUpperCase()
      }
    },
  }),
  updated() {
    if (this.isAuthenticated) {
      // Navigate to root path (home component)
      this.$router.push('/')
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout')
    },
    checkAuth(auth) {
      console.log('Authenticated!', auth)
      // Add direct navigation when authenticated
      if (auth) {
        console.log('Navigating to home...')
        // First update our local authentication state before navigation
        this.$store.state.auth.status.loggedIn = true

        // Force reload to update authentication status everywhere
        window.location.reload()
      }
    },
  },
}
</script>
<template>
  <v-app :theme="theme">
    <!-- App Bar when authenticated -->
    <v-app-bar :title="title" v-if="isAuthenticated" color="#121212">
      <v-spacer></v-spacer>
      <v-btn to="/" default>Home</v-btn>
      <v-btn to="about">About</v-btn>
      <v-btn
        :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="changeTheme"
      >
        Toggle Theme
      </v-btn>
      <v-btn @click="logout()">Logout</v-btn>
      <!-- User avatar -->
      <v-avatar color="primary" size="36" class="ml-4">
        <span class="text-h6">{{ userInitials }}</span>
      </v-avatar>
    </v-app-bar>
    <v-main>
      <v-container>
        <div v-if="isAuthenticated">
          <RouterView />
        </div>
        <LoginView v-else :is-authenticated="isAuthenticated" @authenticate="checkAuth($event)" />
      </v-container>
    </v-main>
  </v-app>
</template>
<style>
/* Global styles */
body {
  background-color: #121212;
  color: white;
}
</style>
