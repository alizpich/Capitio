import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Membres from './pages/Membres'
import Tresorerie from './pages/Tresorerie'
import Planning from './pages/Planning'
import Benevoles from './pages/Benevoles'
import Evenements from './pages/Evenements'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0B1A3E', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: '1.5rem', color: '#fff' }}>
          CAPIT<span style={{ display: 'inline-block', width: 4, height: '0.9em', background: '#FF6B2B', margin: '0 1px', borderRadius: 1, position: 'relative', top: -1 }} />O
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.84rem' }}>Chargement…</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={
        <PrivateRoute>
          <AppLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="membres"     element={<Membres />} />
        <Route path="tresorerie"  element={<Tresorerie />} />
        <Route path="planning"    element={<Planning />} />
        <Route path="benevoles"   element={<Benevoles />} />
        <Route path="evenements"  element={<Evenements />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
