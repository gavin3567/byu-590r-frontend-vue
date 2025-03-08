import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginView',
  props: {
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['authenticate'],
  data() {
    return {
      showLoginForm: true,
      isFormValid: false,
      isRegisterFormValid: false,
      passwordResetFormIsValid: false,
      email: '',
      password: '',
      isLoading: false,
      errorMsg: '',
      successMsg: '',

      // Register dialog
      registerDialog: false,
      registerFormIsLoading: false,
      register: {
        name: '',
        email: '',
        password: '',
        c_password: '',
      },

      // Password reset
      passwordResetDialog: false,
      forgotEmail: '',
      submitForgotPasswordLoading: false,
      forgotPasswordSuccess: false,

      // Validation rules
      emailRules: [
        (v: string) => !!v || 'Email is required',
        (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
      nameRules: [
        (v: string) => !!v || 'Name is required',
        (v: string) => v.length >= 3 || 'Name must be at least 3 characters',
      ],
      passwordRules: [
        (v: string) => !!v || 'Password is required',
        (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
      ],
    }
  },
  computed: {
    confirmPasswordRules() {
      return [
        (v: string) => !!v || 'Password confirmation is required',
        (v: string) => v === this.register.password || 'Passwords must match',
      ]
    },
  },
  methods: {
    submitLogin() {
      if (!this.isFormValid) {
        return
      }

      const user = {
        email: this.email,
        password: this.password,
      }

      this.errorMsg = ''
      this.isLoading = true

      this.$store.dispatch('auth/login', user).then(
        (response) => {
          this.successMsg = 'Login successful! Redirecting...'
          this.isLoading = false

          // Force direct navigation to root (which is your home route)
          setTimeout(() => {
            this.$emit('authenticate', true)
            // Use browser navigation to force a clean redirect
            window.location.href = '/'
          }, 1500)
        },
        (error) => {
          this.isLoading = false
          this.errorMsg =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString()
        }
      )
    },

    submitRegister() {
      if (!this.isRegisterFormValid) {
        return
      }

      const register = {
        name: this.register.name,
        email: this.register.email,
        password: this.register.password,
        c_password: this.register.c_password,
      }

      this.registerFormIsLoading = true

      this.$store.dispatch('auth/register', register).then(
        (response) => {
          this.successMsg = 'Registration successful!'
          this.registerFormIsLoading = false
          this.registerDialog = false

          // Auto-fill login fields with registration data
          this.email = register.email
          this.password = register.password
        },
        (error) => {
          this.registerFormIsLoading = false
          this.errorMsg =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString()
        }
      )
    },

    submitForgotPassword() {
      if (!this.passwordResetFormIsValid) {
        return
      }

      this.submitForgotPasswordLoading = true

      this.$store.dispatch('auth/forgotPassword', this.forgotEmail).then(
        (response) => {
          this.successMsg = 'Password reset instructions sent to your email!'
          this.submitForgotPasswordLoading = false
          this.forgotPasswordSuccess = true
        },
        (error) => {
          this.submitForgotPasswordLoading = false
          this.errorMsg =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString()
        }
      )
    },

    closePasswordResetDialog() {
      this.passwordResetDialog = false
      // Reset state when closing dialog
      if (this.forgotPasswordSuccess) {
        this.forgotPasswordSuccess = false
        this.forgotEmail = ''
      }
    },

    goToResetPassword() {
      this.passwordResetDialog = false
      // Force a full page navigation instead of router push
      window.location.href = window.location.origin + '/reset-password'
    },
  },
})
