import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Manager Pages
import LoginManager from './pages/manager/Login';
import DashboardManager from './pages/manager/Dashboard';
import Stylists from './pages/manager/Stylists';
import Products from './pages/manager/Products';
import Sales from './pages/manager/Sales';
import Clients from './pages/manager/Clients';
import AppConfig from './pages/manager/AppConfig';
import ProfileManager from './pages/manager/Profile';
import Settings from './pages/manager/Settings';
import RecentActivityManager from './pages/manager/RecentActivity';

// Super Admin Pages
import LoginSuper from './pages/super/Login';
import DashboardSuper from './pages/super/Dashboard';
import Managers from './pages/super/Managers';
import ProfileSuper from './pages/super/Profile';
import RecentActivitySuper from './pages/super/RecentActivity';

// Shared/Other Pages
import Seeding from './pages/Seeding';
import Developer from './pages/Developer';
import APIDocumentation from './pages/APIDocumentation';

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

                        {/* Separate Login Pages */}
                        <Route path="/manager/login" element={<LoginManager forcedRole="manager" />} />
                        <Route path="/super/login" element={<LoginSuper forcedRole="super" />} />
                        <Route path="/login" element={<Navigate to="/manager/login" replace />} />

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
                            <Route path="dashboard" element={<DashboardSuper />} />
                            <Route path="managers" element={<Managers />} />
                            <Route path="profile" element={<ProfileSuper />} />
                            <Route path="activity" element={<RecentActivitySuper />} />
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
                            <Route path="dashboard" element={<DashboardManager />} />
                            <Route path="stylists" element={<Stylists />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="products" element={<Products />} />
                            <Route path="sales" element={<Sales />} />
                            <Route path="app-config" element={<AppConfig />} />
                            <Route path="profile" element={<ProfileManager />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="activity" element={<RecentActivityManager />} />
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
