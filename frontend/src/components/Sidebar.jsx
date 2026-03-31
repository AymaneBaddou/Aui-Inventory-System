import { Link, useLocation } from 'react-router-dom'

function Sidebar({ onClose, onLogout, isAdmin }) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', category: 'main' },
    { path: '/add-item', label: 'Add Item', icon: '➕', category: 'main' },
    { path: '/log-operation', label: 'Log Operation', icon: '📝', category: 'operations' },
    { path: '/transaction-history', label: 'Transaction History', icon: '📋', category: 'operations' },
    { path: '/users', label: 'Staff Users', icon: '👥', category: 'operations', adminOnly: true },
    { path: '/change-password', label: 'Change Password', icon: '🔒', category: 'account' }
  ]

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin)
  const mainNav = visibleNavItems.filter(item => item.category === 'main')
  const operationsNav = visibleNavItems.filter(item => item.category === 'operations')
  const accountNav = visibleNavItems.filter(item => item.category === 'account')

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="w-64 bg-white min-h-screen border-r border-gray-200 flex flex-col">
      {/* Header with Logo and Toggle */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-900">AUI Inventory</span>
          </div>

          {/* Close/Collapse Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-5 space-y-8">
        {/* Main Section */}
        <div>
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
            {operationsNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
            {accountNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-left"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium text-sm">Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar