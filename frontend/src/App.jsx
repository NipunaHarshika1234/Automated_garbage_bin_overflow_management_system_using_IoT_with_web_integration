import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Public from './pages/Public';
import AdminDashboard from './pages/AdminDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import Login from './pages/Login';

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  if (!token || !user.uid) {
    return <Navigate to="/" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
        <Routes>
          <Route path="/" element={<Public />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/*"
            element={
              <ProtectedRoute role="citizen">
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
