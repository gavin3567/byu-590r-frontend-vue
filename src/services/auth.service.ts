import axios from 'axios'
import API_URL from './env'

class AuthService {
  login(user) {
    let formData = new FormData()
    formData.append('email', user.email)
    formData.append('password', user.password)
    return axios.post(API_URL + 'login', formData).then((response) => {
      console.log('Login response:', response.data)
      // Handle various response structures
      if (response.data && response.data.data && response.data.data.token) {
        // Structure: response.data.data.token
        localStorage.setItem('user', JSON.stringify(response.data.data))
      } else if (response.data && response.data.token) {
        // Structure: response.data.token
        localStorage.setItem('user', JSON.stringify(response.data))
      } else if (response.data && response.data.results && response.data.results.token) {
        // Structure: response.data.results.token
        localStorage.setItem('user', JSON.stringify(response.data.results))
      }
      return response.data
    })
  }

  logout() {
    localStorage.removeItem('user')
  }

  register(user) {
    return axios.post(API_URL + 'register', {
      name: user.name,
      email: user.email,
      password: user.password,
      c_password: user.c_password,
    })
  }

  forgotPassword(forgotEmail) {
    console.log('inside service -- ', forgotEmail)
    let formData = new FormData()
    formData.append('email', forgotEmail)
    // Use the forgot_password endpoint
    return axios.post(API_URL + 'forgot_password', formData).then((response) => {
      return response.data
    })
  }

  resetPassword(resetData) {
    let formData = new FormData()
    formData.append('email', resetData.email)
    formData.append('token', resetData.token)
    formData.append('password', resetData.password)
    formData.append('c_password', resetData.c_password)

    return axios.post(API_URL + 'reset_password', formData).then((response) => {
      return response.data
    })
  }
}

const authService = new AuthService()
export default authService
