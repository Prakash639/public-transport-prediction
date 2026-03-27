import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PassengerBusSearch from './pages/passenger/PassengerBusSearch';
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import IssueReport from './pages/passenger/IssueReport';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/search"
          element={
            <ProtectedRoute roles={['passenger', 'user', 'admin', 'driver']}>
              <PassengerBusSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/report-issue"
          element={
            <ProtectedRoute roles={['passenger', 'user', 'admin', 'driver']}>
              <IssueReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
