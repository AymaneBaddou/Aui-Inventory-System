import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // For demo purposes, accept any email/password combination
      if (email && password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Store auth token (in real app, this would come from API)
        localStorage.setItem('authToken', 'demo-token')
        localStorage.setItem('userEmail', email)

        onLogin()
        navigate('/')
      } else {
        setMessage('Please fill in all fields')
      }
    } catch (error) {
      setMessage('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyles = "w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-500"
  const buttonStyles = "w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="h-10 w-10 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">AUI Inventory</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to manage inventory
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputStyles}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={inputStyles}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
              {message}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={buttonStyles}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Demo: Any email/password combination will work
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
