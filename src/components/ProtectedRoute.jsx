import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        // Instead of redirecting to /login, show the login form directly for this role
        // This keeps / for manager login and /super for super admin login
        return <Login forcedRole={requiredRole} />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // If wrong role, redirect to their appropriate home
        return <Navigate to={user?.role === 'super' ? '/super/dashboard' : '/manager/dashboard'} replace />;
    }

    return children;
};

export default ProtectedRoute;
