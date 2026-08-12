import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import AuditTrail from './pages/AuditTrail';

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/purchases" element={
            <ProtectedRoute roles={['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']}>
              <Purchases />
            </ProtectedRoute>
          } />
          <Route path="/transfers" element={
            <ProtectedRoute roles={['ADMIN', 'LOGISTICS_OFFICER']}>
              <Transfers />
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute roles={['ADMIN', 'BASE_COMMANDER']}>
              <Assignments />
            </ProtectedRoute>
          } />
          <Route path="/audit" element={
            <ProtectedRoute roles={['ADMIN', 'BASE_COMMANDER']}>
              <AuditTrail />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}
