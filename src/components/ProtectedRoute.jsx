import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredType }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        // If not authenticated, send to appropriate login based on requested type
        if (requiredType === 'platformowner') {
            return <Navigate to="/super" replace />;
        }
        return <Navigate to="/" replace />;
    }

    if (requiredType && user?.type !== requiredType) {
        // Allow platform owner to access salon owner routes (impersonation)
        if (user?.type === 'platformowner' && requiredType === 'salonowner') {
            return children;
        }
        // Redirect to appropriate home without looping
        if (user?.type === 'platformowner' && requiredType !== 'platformowner') {
            return <Navigate to="/super/dashboard" replace />;
        }
        if (user?.type === 'salonowner' && requiredType !== 'salonowner') {
            return <Navigate to="/manager/dashboard" replace />;
        }
        // Unknown or corrupted user session: send to login
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
