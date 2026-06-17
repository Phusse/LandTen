import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './features/auth/Login'
import { KycQueue } from './features/kyc/KycQueue'
import { PropertyQueue } from './features/properties/PropertyQueue'
import { UserManagement } from './features/users/UserManagement'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/kyc" replace />} />
        <Route path="kyc" element={<KycQueue />} />
        <Route path="properties" element={<PropertyQueue />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Routes>
  )
}
