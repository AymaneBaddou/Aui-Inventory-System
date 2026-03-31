import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage('Please fill in all fields')
        setIsLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setMessage('New passwords do not match')
        setIsLoading(false)
        return
      }

      if (newPassword.length < 6) {
        setMessage('New password must be at least 6 characters long')
        setIsLoading(false)
        return
      }

      await axios.post(`${apiBaseUrl}/change-password/`, {
        current_password: currentPassword,
        new_password: newPassword
      })

      setMessage('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMessage(error.response.data.detail)
      } else {
        setMessage('Failed to change password. Please try again.')
      }
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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Change Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Update your account password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                id="current-password"
                name="current-password"
                type="password"
                required
                className={inputStyles}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                className={inputStyles}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className={inputStyles}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg border ${
              message.includes('successfully')
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className={buttonStyles}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 px-4 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword