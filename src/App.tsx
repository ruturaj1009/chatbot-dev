import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import ChatbotScreen from './screens/ChatbotScreen'
import ProfileScreen from './screens/ProfileScreen'
import JobPostingScreen from './screens/JobPostingScreen'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Layout>
              <Routes>
                <Route path="/" element={<ChatbotScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/jobs" element={<JobPostingScreen />} />
              </Routes>
            </Layout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App