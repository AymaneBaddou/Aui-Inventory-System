import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import { AuthProvider, useAuth } from './context/AuthContext'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null
  return isAuthenticated && token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null
  return isAuthenticated && token && isAdmin ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, isLoading, logout } = useAuth()
  const [items, setItems] = useState([])
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  const fetchItems = () => {
    axios.get(`${apiBaseUrl}/items/`)
      .then(response => {
        setItems(response.data)
      })
      .catch(error => console.error('Error fetching inventory:', error))
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems()
    }
  }, [isAuthenticated])

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
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout onLogout={logout} isAdmin={isAdmin}>
                <Dashboard items={items} onRefreshItems={fetchItems} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-item"
          element={
            <ProtectedRoute>
              <Layout onLogout={logout} isAdmin={isAdmin}>
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
            <ProtectedRoute>
              <Layout onLogout={logout} isAdmin={isAdmin}>
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
            <ProtectedRoute>
              <Layout onLogout={logout} isAdmin={isAdmin}>
                <Inventory items={items} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <Layout onLogout={logout} isAdmin={isAdmin}>
                <AddUser />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/transaction-history"
          element={
            <ProtectedRoute>
              <Layout onLogout={logout} isAdmin={isAdmin}>
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

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
