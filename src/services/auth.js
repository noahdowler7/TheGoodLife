import { api } from './api'

const TOKEN_KEY = 'thegoodlife_token'
const USER_KEY = 'thegoodlife_user'

export const auth = {
  async login(email) {
    const response = await api.post('/api/v1/auth/magic-link', { email })
    // prod: { message } — dev: { token, message }
    return response
  },

  async verify(token) {
    const response = await api.post('/api/v1/auth/verify', { token })
    localStorage.setItem(TOKEN_KEY, response.access_token)

    // Fetch user profile
    const user = await api.get('/api/v1/users/me')
    localStorage.setItem(USER_KEY, JSON.stringify(user))

    return { token: response.access_token, user }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!this.getToken()
  },
}
