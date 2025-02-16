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
      showLoginForm: false,
      isValid: false,
      username: '',
      password: '',
      loading: false,
      resetEmail: '',
      forgotPasswordDialog: false,
      hardcodedUsername: 'BYU',
      hardcodedPassword: 'CosmoCougar1',
      loginStatus: {
        show: false,
        type: '',
        message: '',
      },
      usernameRules: [
        (v: string) => !!v || 'Username is required',
        (v: string) => v.length >= 3 || 'Min 3 characters',
      ],
      passwordRules: [
        (v: string) => !!v || 'Password is required',
        (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
      ],
    }
  },
  methods: {
    submitLogin() {
      if (!this.showLoginForm) {
        this.showLoginForm = true
        return
      }

      this.loginStatus.show = true

      if (this.password === this.username) {
        this.loginStatus.type = 'warning'
        this.loginStatus.message = 'Your username and password can not be the same!'
        return
      }

      if (this.username !== this.hardcodedUsername || this.password !== this.hardcodedPassword) {
        this.loginStatus.type = 'error'
        this.loginStatus.message = 'Login Failed! Can not Authenticate!'
        return
      }

      // Successful login
      this.loading = true
      this.loginStatus.type = 'success'
      this.loginStatus.message = 'Login Success. Redirecting!'

      setTimeout(() => {
        this.$emit('authenticate', true)
        // Navigate to home page
        this.$router.push('')
      }, 3000)
    },
  },
})
