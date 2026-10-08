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
import RecentActivityManager from './pages/manager/RecentActivity';

// Super Admin Pages
import LoginSuper from './pages/super/Login';
import DashboardSuper from './pages/super/Dashboard';
import Managers from './pages/super/Managers';
import ManagerForm from './pages/super/ManagerForm';
import ProfileSuper from './pages/super/Profile';
import RecentActivitySuper from './pages/super/RecentActivity';
import SettingsSuper from './pages/super/Settings';

// Shared/Other Pages
import Seeding from './pages/Seeding';
import Developer from './pages/Developer';
import APIDocumentation from './pages/APIDocumentation';

import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

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
                        <Navigate to={user?.type === 'platformowner' ? '/super/dashboard' : '/manager/dashboard'} replace />
                    )
                }
            />

            {/* Platform Owner Routes */}
            <Route path="/super">
                <Route
                    index
                    element={
                        !isAuthenticated ? (
                            <LoginSuper />
                        ) : (
                            user?.type === 'salonowner' ? (
                                <Navigate to="/manager/dashboard" replace />
                            ) : (
                                <Navigate to="/super/dashboard" replace />
                            )
                        )
                    }
                />
                <Route
                    element={
                        <ProtectedRoute requiredType="platformowner">
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<DashboardSuper />} />
                    <Route path="managers" element={<Managers />} />
                    <Route path="managers/new" element={<ManagerForm mode="add" />} />
                    <Route path="managers/edit/:id" element={<ManagerForm mode="edit" />} />
                    <Route path="profile" element={<ProfileSuper />} />
                    <Route path="activity" element={<RecentActivitySuper />} />
                    <Route path="settings" element={<SettingsSuper />} />
                </Route>
            </Route>

            <Route path="/seeding" element={<Seeding />} />

            {/* Salon Owner Routes */}
            <Route
                path="/manager"
                element={
                    <ProtectedRoute requiredType="salonowner">
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
                <Route path="activity" element={<RecentActivityManager />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </ToastProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;

