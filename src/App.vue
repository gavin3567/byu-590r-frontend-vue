<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import LoginView from './views/login/LoginView.vue'
import { mapState } from 'vuex'
import { ref, computed } from 'vue'

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
  data: function () {
    return {
      profileDialog: false,
      profileIsUploading: false,
      verificationEmailLoading: false,
      showEmailNotVerifiedDialog: false,
      showChangeEmailTextField: false,
      changeEmail: false,
      successVerificationMessage: '',
      changeEmailRules: [
        (value) => !!value || 'Required.',
        (value) => (value && value.length >= 3) || 'Min 3 characters',
      ],
      profile: {
        avatar: '',
        name: '',
        title: '',
        icon: 'mdi-account-circle',
        color: 'info',
      },
      profilePictureImage: '',
      emailOfVerification: '',
    }
  },
  computed: {
    ...mapState({
      user() {
        return this.$store.state.user.user
      },
      auth() {
        return this.$store.state.auth
      },
      authUser() {
        return this.auth.user
      },
      isAuthenticated(): boolean {
        return !!(this.auth.status.loggedIn && this.authUser && this.authUser.token !== undefined)
      },
      title() {
        return 'Welcome ' + this.authUser.name + '!'
      },
      avatarURL() {
        return this.auth.user.avatar
      },
      profilePictureChangeLabel() {
        return 'Profile picture change22'
      },
    }),
    // Check if current route is the reset password page
    isResetPasswordRoute() {
      return this.$route.path === '/reset-password'
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
  },
  created() {
    if (this.authUser) {
      this.getCurrentUser()
    }
  },
  updated() {
    // Only redirect to home if authenticated and not on reset password page
    if (this.isAuthenticated === true && !this.isResetPasswordRoute) {
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
    onAvatarChange(e) {
      var image = e.target.files || e.dataTransfer.files
      if (!image.length) return
      this.profileIsUploading = true
      this.$store
        .dispatch('user/uploadAvatar', image[0], { root: true })
        .then((response) => {
          this.$store.commit('auth/uploadAvatarSuccess', response.avatar)
          this.profileIsUploading = false
        })
        .catch((error) => {
          console.log(error)
          alert('Error. Try again')
          this.profileIsUploading = false
        })
    },
    removeAvatar() {
      this.profileIsUploading = true
      this.$store
        .dispatch('user/removeAvatar')
        .then((response) => {
          this.$store.commit('auth/uploadAvatarSuccess', response.avatar)
          this.profileIsUploading = false
        })
        .catch((error) => {
          console.log(error)
          alert('Error. Try again')
          this.profileIsUploading = false
        })
    },
    getCurrentUser() {
      this.profile.name = this.authUser.name
      this.profile.title = this.title
      this.$store.dispatch('user/getUser').then((response) => {
        if (response.avatar) {
          this.$store.commit('auth/uploadAvatarSuccess', response.avatar)
        }
        if (!response.email_verified_at) {
          this.showEmailNotVerifiedDialog = true
        }
      })
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
        <!-- Show the router view for authenticated users and reset password route -->
        <RouterView v-if="isAuthenticated === true || isResetPasswordRoute" />
        <!-- Show login view for unauthenticated users on other routes -->
        <LoginView v-else :is-authenticated="!!isAuthenticated" @authenticate="checkAuth($event)" />
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
