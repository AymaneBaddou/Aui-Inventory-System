import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddItem from './pages/AddItem'
import LogOperation from './pages/LogOperation'
import Inventory from './pages/Inventory'
import ChangePassword from './pages/ChangePassword'
import TransactionHistory from './pages/TransactionHistory'
import AddUser from './pages/AddUser'

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children, isAuthenticated, isAdmin }) {
  return isAuthenticated && isAdmin ? children : <Navigate to="/" replace />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState([])
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const storedAdmin = localStorage.getItem('isAdmin') === 'true'
    if (token) {
      setIsAuthenticated(true)
      setIsAdmin(storedAdmin)
    }
    setIsLoading(false)
  }, [])

  const fetchItems = () => {
    axios.get(`${apiBaseUrl}/items/`)
      .then(response => {
        setItems(response.data)
      })
      .catch(error => console.error("Error fetching inventory:", error))
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems()
    }
  }, [isAuthenticated])

  const handleLogin = (admin = false) => {
    setIsAuthenticated(true)
    setIsAdmin(admin)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('isAdmin')
    setIsAuthenticated(false)
    setIsAdmin(false)
    setItems([])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} isAdmin={isAdmin}>
                <Dashboard items={items} onRefreshItems={fetchItems} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-item"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} isAdmin={isAdmin}>
                <div className="max-w-2xl mx-auto">
                  <AddItem onItemAdded={fetchItems} />
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/log-operation"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} isAdmin={isAdmin}>
                <div className="max-w-2xl mx-auto">
                  <LogOperation items={items} onOperationLogged={fetchItems} />
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} isAdmin={isAdmin}>
                <Inventory items={items} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
              <Layout onLogout={handleLogout} isAdmin={isAdmin}>
                <AddUser />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/transaction-history"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} isAdmin={isAdmin}>
                <TransactionHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  )
}

export default App