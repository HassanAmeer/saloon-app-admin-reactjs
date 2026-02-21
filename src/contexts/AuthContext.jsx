import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Persist login state using localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('salon_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('salon_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('salon_user', JSON.stringify(userData));
        return { success: true };
    };

    const logout = async () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('salon_user');
    };

    const value = {
        user,
        setUser,
        type: user?.type,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
