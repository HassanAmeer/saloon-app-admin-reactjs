import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginManager from '../pages/manager/Login';
import LoginSuper from '../pages/super/Login';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        if (requiredRole === 'super') {
            return <LoginSuper />;
        }
        return <LoginManager />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // If wrong role, redirect to their appropriate home
        return <Navigate to={user?.role === 'super' ? '/super/dashboard' : '/manager/dashboard'} replace />;
    }

    return children;
};

export default ProtectedRoute;
