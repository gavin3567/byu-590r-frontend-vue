<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import LoginView from './views/login/LoginView.vue'
import { mapState } from 'vuex'
import { ref, computed } from 'vue'

export default {
  setup() {
    const theme = ref('dark')
    const drawer = ref(false)

    function changeTheme() {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    function toggleDrawer() {
      drawer.value = !drawer.value
    }

    return { theme, changeTheme, drawer, toggleDrawer }
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
      menuItems: [
        { title: 'Home', icon: 'mdi-home', to: '/' },
        { title: 'About', icon: 'mdi-information', to: '/about' },
        { title: 'Pokemon Cards', icon: 'mdi-cards', to: '/pokemon-cards' },
      ],
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
        return 'Profile picture change'
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
    // Detect if screen is mobile size
    isMobile() {
      return this.$vuetify.display.mdAndDown
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
        .dispatch('user/uploadAvatar', image[0])
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
          this.$store.commit('auth/uploadAvatarSuccess', null)
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
    openProfileDialog() {
      this.profileDialog = true
    },
    sendVerificationEmail() {
      this.verificationEmailLoading = true
      this.$store
        .dispatch('user/sendVerificationEmail')
        .then(() => {
          this.successVerificationMessage = 'Verification email sent successfully!'
          this.verificationEmailLoading = false
        })
        .catch((error) => {
          console.log(error)
          alert('Error sending verification email. Please try again.')
          this.verificationEmailLoading = false
        })
    },
    closeDrawer() {
      this.drawer = false
    },
  },
}
</script>

<template>
  <v-app :theme="theme">
    <!-- App Bar when authenticated -->
    <v-app-bar :title="title" v-if="isAuthenticated" color="#121212">
      <!-- Mobile menu button -->
      <template v-slot:prepend>
        <v-app-bar-nav-icon
          v-if="$vuetify.display.mdAndDown"
          @click="toggleDrawer"
        ></v-app-bar-nav-icon>
      </template>

      <!-- Title with responsive truncation -->
      <v-app-bar-title class="text-truncate">
        <span class="d-none d-sm-block">{{ title }}</span>
        <span class="d-sm-none">Welcome!</span>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Desktop navigation buttons -->
      <div class="d-none d-md-flex">
        <v-btn to="/" default>Home</v-btn>
        <v-btn to="about">About</v-btn>
        <v-btn to="pokemon-cards">Pokemon Cards</v-btn>
        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="changeTheme"
        >
          Toggle Theme
        </v-btn>
        <v-btn @click="logout()">Logout</v-btn>
      </div>

      <!-- Theme toggle for mobile - always visible -->
      <v-btn
        v-if="$vuetify.display.mdAndDown"
        :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="changeTheme"
      ></v-btn>

      <!-- User avatar with dropdown menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-avatar v-bind="props" color="primary" size="36" class="ml-4" style="cursor: pointer">
            <!-- Show avatar if exists -->
            <v-img v-if="avatarURL" :src="avatarURL" alt="User Avatar"></v-img>
            <!-- Show user initials if no avatar -->
            <span v-else class="text-h6">{{ userInitials }}</span>
          </v-avatar>
        </template>

        <v-card min-width="200">
          <v-card-title>Profile</v-card-title>
          <v-card-text>
            <p class="mb-2">{{ authUser.name }}</p>
            <p class="text-caption mb-4">{{ authUser.email }}</p>

            <v-btn color="primary" block @click="openProfileDialog"> Edit Profile </v-btn>

            <!-- Logout button in dropdown for mobile -->
            <v-btn
              v-if="$vuetify.display.mdAndDown"
              color="error"
              block
              class="mt-2"
              @click="logout()"
            >
              Logout
            </v-btn>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Navigation drawer for mobile -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      v-if="isAuthenticated && $vuetify.display.mdAndDown"
    >
      <v-list>
        <v-list-item>
          <template v-slot:prepend>
            <v-avatar size="40" color="primary">
              <v-img v-if="avatarURL" :src="avatarURL" alt="User Avatar"></v-img>
              <span v-else>{{ userInitials }}</span>
            </v-avatar>
          </template>
          <v-list-item-title>{{ authUser.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ authUser.email }}</v-list-item-subtitle>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item v-for="item in menuItems" :key="item.title" :to="item.to" @click="closeDrawer">
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Profile Dialog - made responsive -->
    <v-dialog v-model="profileDialog" max-width="500" fullscreen-breakpoint="sm">
      <v-card>
        <v-toolbar v-if="$vuetify.display.smAndDown" color="primary" dark>
          <v-btn icon @click="profileDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Edit Profile</v-toolbar-title>
        </v-toolbar>

        <v-card-title v-else>Edit Profile</v-card-title>

        <v-card-text class="pa-4">
          <div class="text-center mb-4">
            <v-avatar size="100" class="mb-3 position-relative">
              <!-- Avatar display with loading animation -->
              <v-img
                v-if="avatarURL && !profileIsUploading"
                :src="avatarURL"
                alt="User Avatar"
              ></v-img>
              <v-icon v-else-if="!profileIsUploading" size="80" color="grey"
                >mdi-account-circle</v-icon
              >

              <!-- Loading overlay -->
              <v-overlay
                v-if="profileIsUploading"
                :model-value="profileIsUploading"
                class="align-center justify-center"
              >
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-overlay>
            </v-avatar>

            <div class="file-input-container">
              <v-file-input
                accept="image/*"
                label="Change avatar"
                prepend-icon="mdi-camera"
                @change="onAvatarChange"
                hide-input
                class="d-inline-block file-input"
                :disabled="profileIsUploading"
                base-color="primary"
                persistent-hint
                hint="Select an image file"
              ></v-file-input>

              <v-btn
                v-if="avatarURL"
                color="error"
                icon
                @click="removeAvatar"
                :loading="profileIsUploading"
                :disabled="profileIsUploading"
                class="ml-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- Email verification section -->
          <div class="email-verification-container">
            <v-alert
              v-if="showEmailNotVerifiedDialog"
              type="warning"
              title="Email not verified"
              text="Please verify your email address to access all features."
              class="mb-4 mt-6"
            >
              <v-btn
                color="warning"
                @click="sendVerificationEmail"
                :loading="verificationEmailLoading"
                block
              >
                Send verification email
              </v-btn>
              <div v-if="successVerificationMessage" class="text-success mt-2">
                {{ successVerificationMessage }}
              </div>
            </v-alert>
          </div>
        </v-card-text>

        <v-card-actions v-if="!$vuetify.display.smAndDown">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="profileDialog = false">Close</v-btn>
        </v-card-actions>

        <v-card-actions v-else class="pb-4">
          <v-btn color="primary" block @click="profileDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-main>
      <v-container fluid class="pa-2 pa-sm-4">
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

.position-relative {
  position: relative;
}

/* Fixed-size file input */
.file-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}

.file-input {
  min-width: 200px !important;
  height: 40px !important;
}

/* Override Vuetify's dynamic width behavior */
.v-input--density-default {
  --v-input-control-height: 40px !important;
}

.v-field__input {
  min-height: 40px !important;
}

/* Container for email verification to keep it separated */
.email-verification-container {
  margin-top: 60px;
  clear: both;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .v-app-bar .v-btn {
    margin-right: 4px;
  }

  .file-input-container {
    flex-direction: column;
  }

  .file-input-container .v-btn {
    margin-top: 12px;
    margin-left: 0 !important;
  }

  .email-verification-container {
    margin-top: 30px;
  }

  .v-card-text {
    padding: 16px 12px;
  }
}

/* Ensure buttons have proper spacing */
.v-btn {
  text-transform: none;
}

/* Make dialogs edge-to-edge on mobile */
@media (max-width: 600px) {
  .v-dialog {
    margin: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    max-width: 100% !important;
    border-radius: 0;
  }
}
</style>
