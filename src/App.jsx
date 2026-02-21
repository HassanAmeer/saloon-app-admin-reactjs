import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

const AppRoutes = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Routes>
            {/* Entry Points */}
            <Route
                path="/"
                element={
                    !isAuthenticated ? (
                        <LoginManager />
                    ) : (
                        <Navigate to={user?.type === 'superadmin' ? '/super/dashboard' : '/manager/dashboard'} replace />
                    )
                }
            />

            {/* Super Admin Routes */}
            <Route path="/super">
                <Route
                    index
                    element={
                        !isAuthenticated ? (
                            <LoginSuper />
                        ) : (
                            user?.type === 'salonmanager' ? (
                                <Navigate to="/manager/dashboard" replace />
                            ) : (
                                <Navigate to="/super/dashboard" replace />
                            )
                        )
                    }
                />
                <Route
                    element={
                        <ProtectedRoute requiredType="superadmin">
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<DashboardSuper />} />
                    <Route path="managers" element={<Managers />} />
                    <Route path="profile" element={<ProfileSuper />} />
                    <Route path="activity" element={<RecentActivitySuper />} />
                </Route>
            </Route>

            <Route path="/seeding" element={<Seeding />} />

            {/* Salon Manager Routes */}
            <Route
                path="/manager"
                element={
                    <ProtectedRoute requiredType="salonmanager">
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
    );
};

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;

