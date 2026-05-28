import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { HittingTrackerPage } from './pages/HittingTrackerPage'
import { HittingHistoryPage } from './pages/HittingHistoryPage'
import { HittingGameDetailPage } from './pages/HittingGameDetailPage'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hitting"
          element={
            <ProtectedRoute>
              <HittingTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hitting/history"
          element={
            <ProtectedRoute>
              <HittingHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hitting/history/:sessionId"
          element={
            <ProtectedRoute>
              <HittingGameDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
