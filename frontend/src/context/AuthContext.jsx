import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState(null)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common.Authorization
    }
  }

  const login = (token, email, admin) => {
    sessionStorage.setItem('authToken', token)
    sessionStorage.setItem('userEmail', email)
    sessionStorage.setItem('isAdmin', admin ? 'true' : 'false')
    setAuthHeader(token)
    setIsAuthenticated(true)
    setIsAdmin(admin)
    setUserEmail(email)
  }

  const logout = () => {
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('userEmail')
    sessionStorage.removeItem('isAdmin')
    setAuthHeader(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    setUserEmail(null)
  }

  useEffect(() => {
    const token = sessionStorage.getItem('authToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    setAuthHeader(token)
    axios.get(`${apiBaseUrl}/me/`)
      .then(response => {
        setIsAuthenticated(true)
        setIsAdmin(response.data.is_admin)
        setUserEmail(response.data.email)
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
