import axios from 'axios'
import API_URL from './env'

// Authentication header helper function
export function authHeader(type?: 'multipart' | null) {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    return {}
  }

  try {
    const user = JSON.parse(userStr)

    if (user && user.token) {
      if (type === 'multipart') {
        return {
          Authorization: 'Bearer ' + user.token,
          'Content-Type': 'multipart/form-data',
        }
      }
      return { Authorization: 'Bearer ' + user.token }
    } else {
      return {}
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return {}
  }
}

// Authentication service class
class AuthService {
  login(user) {
    let formData = new FormData()
    formData.append('email', user.email)
    formData.append('password', user.password)

    return axios.post(API_URL + 'login', formData).then((response) => {
      console.log('Login response:', response.data)
      if (response.data.data && response.data.data.token) {
        // Store the complete user data with token
        localStorage.setItem('user', JSON.stringify(response.data.data))
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

    return axios.post(API_URL + 'forgot_password', formData).then((response) => {
      return response.data
    })
  }

  // Method to get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      return null
    }

    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      return null
    }
  }

  // Method to check if user is logged in
  isAuthenticated() {
    const user = this.getCurrentUser()
    return !!user && !!user.token
  }
}

const authService = new AuthService()
export default authService
