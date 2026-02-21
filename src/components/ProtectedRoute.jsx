import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        // If not authenticated, send to appropriate login based on requested role
        if (requiredRole === 'super') {
            return <Navigate to="/super" replace />;
        }
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // If wrong role, redirect to their appropriate home
        return <Navigate to={user?.role === 'super' ? '/super/dashboard' : '/manager/dashboard'} replace />;
    }

    return children;
};

export default ProtectedRoute;
