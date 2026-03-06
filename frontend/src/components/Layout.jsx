import { useState } from 'react'
import Sidebar from './Sidebar'

function Layout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative">
            <Sidebar onClose={() => setSidebarOpen(false)} onLogout={onLogout} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar with hamburger menu */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Optional: Add breadcrumb or page title here */}
            <div className="lg:flex-1"></div>
          </div>
        </div>

        {/* Main content area */}
        <main className="p-6 lg:p-8 bg-gray-50 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout