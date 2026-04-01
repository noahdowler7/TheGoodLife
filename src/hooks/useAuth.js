import { useState, useEffect } from 'react'
import { auth } from '../services/auth'

export function useAuth() {
  const [state, setState] = useState({
    token: auth.getToken(),
    user: auth.getUser(),
    loading: false,
    error: null,
  })

  useEffect(() => {
    // Check if token is valid on mount
    if (state.token && !state.user) {
      auth.logout()
      setState({ token: null, user: null, loading: false, error: null })
    }
  }, [])

  const login = async (email) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const magicToken = await auth.login(email)
      return magicToken
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

  const logout = () => {
    auth.logout()
    setState({ token: null, user: null, loading: false, error: null })
  }

  return {
    ...state,
    isAuthenticated: !!state.token,
    login,
    verify,
    logout,
  }
}
