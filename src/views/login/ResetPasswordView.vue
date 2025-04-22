<template>
  <div class="reset-password-page">
    <div class="reset-form-container">
      <h1 class="login-title">Reset Your Password</h1>

      <v-form v-model="isResetFormValid" @submit.prevent="submitResetPassword">
        <v-alert v-if="errorMsg" type="error" :text="errorMsg" class="mb-4" />
        <v-alert v-if="successMsg" type="success" :text="successMsg" class="mb-4" />

        <!-- Form fields -->
        <div class="form-fields">
          <v-text-field
            v-model="resetForm.email"
            label="Email"
            :rules="emailRules"
            required
            variant="underlined"
            bg-color="transparent"
          />

          <v-text-field
            v-model="resetForm.token"
            label="Reset Token (from email)"
            :rules="tokenRules"
            required
            variant="underlined"
            bg-color="transparent"
          />

          <v-text-field
            v-model="resetForm.password"
            label="New Password"
            type="password"
            :rules="passwordRules"
            required
            variant="underlined"
            bg-color="transparent"
          />

          <v-text-field
            v-model="resetForm.c_password"
            label="Confirm New Password"
            type="password"
            :rules="confirmPasswordRules"
            required
            variant="underlined"
            bg-color="transparent"
          />

          <!-- Submit button - responsive layout -->
          <div class="button-row">
            <v-btn
              color="#333"
              type="submit"
              :loading="isResetting"
              :disabled="!isResetFormValid"
              class="login-btn"
            >
              RESET PASSWORD
            </v-btn>

            <div class="secondary-buttons">
              <v-btn variant="text" :to="'/login'" class="secondary-btn"> RETURN TO LOGIN </v-btn>
            </div>
          </div>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import authService from '../../services/auth.service'

export default defineComponent({
  name: 'ResetPasswordView',
  data() {
    return {
      isResetFormValid: false,
      isResetting: false,
      errorMsg: '',
      successMsg: '',

      resetForm: {
        email: '',
        token: '',
        password: '',
        c_password: '',
      },

      // Validation rules
      emailRules: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
      tokenRules: [(v) => !!v || 'Token is required'],
      passwordRules: [
        (v) => !!v || 'Password is required',
        (v) => v.length >= 8 || 'Password must be at least 8 characters',
      ],
    }
  },
  computed: {
    confirmPasswordRules() {
      return [
        (v) => !!v || 'Confirm password is required',
        (v) => v === this.resetForm.password || 'Passwords must match',
      ]
    },
    // Detect if screen is mobile size
    isMobile() {
      return this.$vuetify?.display?.smAndDown || false
    },
  },
  methods: {
    submitResetPassword() {
      if (!this.isResetFormValid) {
        return
      }

      this.errorMsg = ''
      this.successMsg = ''
      this.isResetting = true

      authService.resetPassword(this.resetForm).then(
        (response) => {
          this.successMsg = 'Password reset successful! Redirecting to login...'
          this.isResetting = false

          // Redirect to login page after success
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        },
        (error) => {
          this.isResetting = false
          this.errorMsg =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString()
        }
      )
    },
  },
})
</script>

<style scoped>
.reset-password-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #121212;
  padding: 40px 16px;
}

.reset-form-container {
  width: 100%;
  max-width: 500px;
  color: white;
}

.login-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 20px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.button-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 24px;
}

.login-btn {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 400;
  height: 44px;
  padding: 0 20px;
  border-radius: 0;
}

.secondary-buttons {
  display: flex;
  margin-left: 20px;
}

.secondary-btn {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 400;
  height: 44px;
  padding: 0 20px;
  border-radius: 0;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .reset-password-page {
    padding: 20px 12px;
    align-items: center;
  }

  .login-title {
    font-size: 20px;
    text-align: center;
  }

  .button-row {
    flex-direction: column;
    width: 100%;
  }

  .login-btn {
    width: 100%;
  }

  .secondary-buttons {
    flex-direction: column;
    width: 100%;
    margin-left: 0;
    margin-top: 16px;
  }

  .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
