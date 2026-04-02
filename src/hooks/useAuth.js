import { useState, useEffect } from 'react'
import { auth } from '../services/auth'

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
    // Check if token is valid on mount
    if (state.token && !state.user) {
      auth.logout()
      setState(prev => ({ ...prev, token: null, user: null }))
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
