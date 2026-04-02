import { useState, useEffect } from 'react'
import { auth } from '../services/auth'
import { api } from '../services/api'

const GUEST_MODE_KEY = 'thegoodlife_guest_mode'

export function useAuth() {
  const [state, setState] = useState({
    token: auth.getToken(),
    user: auth.getUser(),
    guestMode: localStorage.getItem(GUEST_MODE_KEY) === 'true',
    loading: false,
    error: null,
  })

  useEffect(() => {
    // Validate token on mount — only clear on auth failure, not network errors
    if (state.token && !state.user) {
      api.get('/api/v1/users/me')
        .then(user => {
          localStorage.setItem('thegoodlife_user', JSON.stringify(user))
          setState(prev => ({ ...prev, user }))
        })
        .catch(err => {
          if (err.message?.includes('401') || err.message?.includes('403')) {
            auth.logout()
            setState(prev => ({ ...prev, token: null, user: null }))
          }
          // Network errors: keep token, user will re-sync when online
        })
    }
  }, [])

  const login = async (email) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const result = await auth.login(email)
      setState(prev => ({ ...prev, loading: false }))
      return result
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      throw error
    }
  }

  const verify = async (token) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const { token: accessToken, user } = await auth.verify(token)
      setState({ token: accessToken, user, loading: false, error: null })
      return user
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      throw error
    }
  }

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_MODE_KEY, 'true')
    setState(prev => ({ ...prev, guestMode: true }))
  }

  const logout = () => {
    auth.logout()
    localStorage.removeItem(GUEST_MODE_KEY)
    setState({ token: null, user: null, guestMode: false, loading: false, error: null })
  }

  return {
    ...state,
    isAuthenticated: !!state.token,
    isGuest: state.guestMode && !state.token,
    hasAccess: !!state.token || state.guestMode,
    continueAsGuest,
    login,
    verify,
    logout,
  }
}
