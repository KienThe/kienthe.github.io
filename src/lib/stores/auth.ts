/* eslint-disable */
import axios from "axios"
import { atom } from "jotai"

const API_URL = "https://backend.metruyencv.com/api"

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialAuthState: AuthState = {
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

export const authAtom = atom<AuthState>(initialAuthState)

export const loginAtom = atom(
  null,
  async (
    get,
    set,
    { email, password }: { email: string; password: string }
  ) => {
    set(authAtom, { ...get(authAtom), loading: true, error: null })

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
          remember: 1,
          device_name: navigator.userAgent
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": navigator.userAgent
          }
        }
      )

      if (response.data.status === 200 && response.data.success) {
        const token = response.data.data.token
        set(authAtom, {
          token,
          isAuthenticated: true,
          loading: false,
          error: null
        })
        return true
      }

      set(authAtom, {
        ...get(authAtom),
        loading: false,
        error: "Login failed"
      })
      return false
    } catch (error) {
      set(authAtom, {
        ...get(authAtom),
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred"
      })
      return false
    }
  }
)
