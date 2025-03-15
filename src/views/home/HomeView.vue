<template>
  <div>
    <h1 class="text-h4 mb-6">This is the home page. I'm in!</h1>

    <v-card class="my-4 pa-4">
      <v-card-title>Your Profile</v-card-title>
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar size="80" class="mr-4">
            <v-img v-if="avatarURL" :src="avatarURL" alt="User Avatar"></v-img>
            <v-icon v-else size="40" color="grey">mdi-account-circle</v-icon>
          </v-avatar>

          <div>
            <h3 class="text-h5">{{ userName }}</h3>
            <p class="text-body-1">{{ userEmail }}</p>

            <v-btn color="primary" class="mt-2" @click="openProfileDialog"> Edit Profile </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'HomeView',
  computed: {
    ...mapState({
      auth: (state) => state.auth,
      user: (state) => state.user.user,
    }),
    avatarURL() {
      return this.auth.user && this.auth.user.avatar ? this.auth.user.avatar : null
    },
    userName() {
      return this.auth.user ? this.auth.user.name : ''
    },
    userEmail() {
      return this.auth.user ? this.auth.user.email : ''
    },
  },
  methods: {
    openProfileDialog() {
      this.$parent.profileDialog = true
    },
  },
}
</script>
