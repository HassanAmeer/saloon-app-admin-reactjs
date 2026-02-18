import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    limit
} from 'firebase/firestore';

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

    const login = async (roleType, email, password) => {
        try {
            let collectionName = roleType === 'super' ? 'super_admins' : 'salon_managers';
            const collectionRef = collection(db, collectionName);
            const q = query(
                collectionRef,
                where('email', '==', email),
                where('password', '==', password),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = {
                    id: querySnapshot.docs[0].id,
                    ...querySnapshot.docs[0].data(),
                    role: roleType
                };
                // Password kept in state as requested for profile visibility
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('salon_user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, error: 'Invalid email or password' };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: 'Connection error. Please try again.' };
        }
    };

    const logout = async () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('salon_user');
    };

    const value = {
        user,
        setUser,
        role: user?.role,
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
