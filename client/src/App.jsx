import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import MemberDetail from './pages/MemberDetail'
import NewMember from './pages/NewMember'
import Funerals from './pages/Funerals'
import FuneralDetail from './pages/FuneralDetail'
import NewFuneral from './pages/NewFuneral'

function PrivateRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>
  if (!admin) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>
  if (admin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/new" element={<NewMember />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/funerals" element={<Funerals />} />
          <Route path="/funerals/new" element={<NewFuneral />} />
          <Route path="/funerals/:id" element={<FuneralDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
