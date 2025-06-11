import React, { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageCircle, User, Briefcase, Plus } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: MessageCircle, label: 'Chat' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Profile Matcher
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Action Buttons */}
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  <Plus size={16} />
                  <span>Add Profile</span>
                </Link>
                <Link
                  to="/jobs"
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  <Plus size={16} />
                  <span>Post Job</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex space-x-8">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      location.pathname === path
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    aria-label={label}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Mobile Quick Actions */}
          <div className="sm:hidden pb-3 flex space-x-2">
            <Link
              to="/profile"
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
            >
              <Plus size={16} />
              <span>Add Profile</span>
            </Link>
            <Link
              to="/jobs"
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
            >
              <Plus size={16} />
              <span>Post Job</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

export default Layout