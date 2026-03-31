import { useState, useEffect } from 'react'
import axios from 'axios'

function AddUser() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = () => {
    axios.get(`${apiBaseUrl}/users/`)
      .then(response => {
        setUsers(response.data)
      })
      .catch(error => {
        console.error("Error fetching users:", error)
      })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    if (!email || !password) {
      setMessage('Email and password are required')
      setIsLoading(false)
      return
    }

    try {
      await axios.post(`${apiBaseUrl}/users/`, {
        email,
        password,
        full_name: fullName
      })
      setMessage('User created successfully')
      setEmail('')
      setPassword('')
      setFullName('')
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      if (error.response?.data?.detail) {
        setMessage(error.response.data.detail)
      } else {
        setMessage('Could not create user. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyles = "w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-500"
  const buttonStyles = "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <span className="text-purple-600 text-lg">👥</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Staff User</h2>
            <p className="text-gray-600 text-sm">Create staff accounts for your inventory app.</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyles}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyles}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputStyles}
            />
          </div>

          {message && (
            <div className={`rounded-xl p-4 text-sm ${message.includes('successfully') ? 'border border-green-200 bg-green-50 text-green-700' : 'border border-red-200 bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={isLoading} className={buttonStyles}>
            {isLoading ? 'Creating user...' : 'Create User'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Staff Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-gray-900">{user.full_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{user.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-6 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AddUser
