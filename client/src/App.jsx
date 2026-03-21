import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
    return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
