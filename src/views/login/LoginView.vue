<template>
  <button v-if="!isAuthenticated" @click="submitLogin()">Login Page Placeholder Here</button>
  <div v-if="showLoginForm && !isAuthenticated" class="login-page">
    <div class="login-form-container">
      <v-form v-model="isValid" @submit.prevent="submitLogin">
        <v-card class="pa-6">
          <v-alert
            v-if="loginStatus.show"
            :type="loginStatus.type"
            :text="loginStatus.message"
            class="mb-4"
          />

          <!-- Form fields in flex column -->
          <div class="form-fields">
            <v-text-field v-model="username" label="Username" :rules="usernameRules" required />

            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              :rules="passwordRules"
              required
            />

            <!-- Buttons section with proper gaps -->
            <div class="button-container">
              <v-btn color="primary" type="submit" :loading="loading" :disabled="!isValid" block>
                Login
              </v-btn>

              <v-btn variant="text" color="primary" @click="forgotPasswordDialog = true" block>
                Forgot Password?
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-form>

      <v-dialog v-model="forgotPasswordDialog" max-width="700px">
        <v-card>
          <v-card-title>Reset Password</v-card-title>
          <v-card-text>
            <div class="d-flex flex-column align-center justify-center pa-4" style="width: 100%">
              <v-text-field
                v-model="resetEmail"
                label="Email"
                type="email"
                class="mb-4"
                style="min-width: 550px"
              />
              <v-btn color="primary" block> Reset Password </v-btn>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" text @click="forgotPasswordDialog = false"> Close </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>
<script src="./LoginView.ts"></script>
<style src="./LoginView.scss"></style>
