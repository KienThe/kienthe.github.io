/* eslint-disable */
import { useCallback, useState } from "react"

interface LoginCredentials {
  email: string
  password: string
}

interface AuthState {
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: false,
    error: null
  })

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      setAuthState({
        isAuthenticated: true,
        loading: false,
        error: null
      })

      return data
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred"
      }))
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      await fetch("/api/auth/logout", {
        method: "POST"
      })

      setAuthState({
        isAuthenticated: false,
        loading: false,
        error: null
      })
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred"
      }))
      throw error
    }
  }, [])

  return {
    ...authState,
    login,
    logout
  }
} 