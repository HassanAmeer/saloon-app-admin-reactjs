import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stylists from './pages/Stylists';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Clients from './pages/Clients';
import AppConfig from './pages/AppConfig';
import Seeding from './pages/Seeding';
import Developer from './pages/Developer';
import APIDocumentation from './pages/APIDocumentation';
import Managers from './pages/Managers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import RecentActivity from './pages/RecentActivity';

import { ToastProvider } from './contexts/ToastContext';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Role Detection Entry Points */}
                        {/* Root / defaults to Salon Manager logic */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute requiredRole="manager">
                                    <Navigate to="/manager/dashboard" replace />
                                </ProtectedRoute>
                            }
                        />

                        {/* /super defaults to Super Admin logic */}
                        <Route
                            path="/super"
                            element={
                                <ProtectedRoute requiredRole="super">
                                    <Navigate to="/super/dashboard" replace />
                                </ProtectedRoute>
                            }
                        />

                        {/* Generic Login for flexibility */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/seeding" element={<Seeding />} />

                        {/* Super Admin Panel Sub-routes */}
                        <Route
                            path="/super"
                            element={
                                <ProtectedRoute requiredRole="super">
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="managers" element={<Managers />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="activity" element={<RecentActivity />} />
                        </Route>

                        {/* Salon Manager Panel Sub-routes */}
                        <Route
                            path="/manager"
                            element={
                                <ProtectedRoute requiredRole="manager">
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="stylists" element={<Stylists />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="products" element={<Products />} />
                            <Route path="sales" element={<Sales />} />
                            <Route path="app-config" element={<AppConfig />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="activity" element={<RecentActivity />} />
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
