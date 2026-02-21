import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredType }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        // If not authenticated, send to appropriate login based on requested type
        if (requiredType === 'superadmin') {
            return <Navigate to="/super" replace />;
        }
        return <Navigate to="/" replace />;
    }

    if (requiredType && user?.type !== requiredType) {
        // If wrong type, redirect to their appropriate home
        return <Navigate to={user?.type === 'superadmin' ? '/super/dashboard' : '/manager/dashboard'} replace />;
    }

    return children;
};

export default ProtectedRoute;
