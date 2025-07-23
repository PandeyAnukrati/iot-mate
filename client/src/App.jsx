import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DevicesPage from './pages/Devices'
import HistoryPage from './pages/HistoryPage'
import DashboardPage from './pages/DashBoard'
import TestPage from './pages/TestPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { HousesProvider } from './context/HousesContext'
import { Toaster } from 'sonner'

function App() {
  return (
    <AuthProvider>
      <HousesProvider>
        <Router>
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            expand={false}
            duration={4000}
          />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/test" element={<TestPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/devices" 
            element={
              <ProtectedRoute>
                <DevicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          {/* You can define more routes like this */}
        </Routes>
      </Router>
      </HousesProvider>
    </AuthProvider>
  )
}

export default App
