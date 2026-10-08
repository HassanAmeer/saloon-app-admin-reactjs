import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
    const [userSalons, setUserSalons] = useState([]);
    const [selectedSalonId, setSelectedSalonId] = useState(null);

    // Persist login state using localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('salon_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData && (userData.type === 'salonowner' || userData.type === 'platformowner')) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    // Load user's salons if salon owner
                    if (userData.type === 'salonowner' && userData.id) {
                        loadUserSalons(userData.id);
                    }
                } else {
                    localStorage.removeItem('salon_user');
                }
            } catch (error) {
                localStorage.removeItem('salon_user');
            }
        }
        setLoading(false);
    }, []);

    const loadUserSalons = async (managerId) => {
        try {
            // Get salons where this manager is the owner
            const salonsRef = collection(db, 'salons');
            const q = query(salonsRef, where('managerId', '==', managerId));
            const snapshot = await getDocs(q);
            const salons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserSalons(salons);
            
            // Set default selected salon (first one or from localStorage)
            const storedSalonId = localStorage.getItem(`selected_salon_${managerId}`);
            if (storedSalonId && salons.some(s => s.id === storedSalonId)) {
                setSelectedSalonId(storedSalonId);
            } else if (salons.length > 0) {
                setSelectedSalonId(salons[0].id);
                localStorage.setItem(`selected_salon_${managerId}`, salons[0].id);
            }
        } catch (error) {
            console.error('Error loading user salons:', error);
        }
    };

    const switchSalon = (salonId) => {
        if (user?.id) {
            localStorage.setItem(`selected_salon_${user.id}`, salonId);
            setSelectedSalonId(salonId);
            // Reload page to refresh data with new salon context
            window.location.reload();
        }
    };

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('salon_user', JSON.stringify(userData));
        // Load salons for salon owners
        if (userData.type === 'salonowner' && userData.id) {
            loadUserSalons(userData.id);
        }
        return { success: true };
    };

    const logout = async () => {
        setUser(null);
        setIsAuthenticated(false);
        setUserSalons([]);
        setSelectedSalonId(null);
        localStorage.removeItem('salon_user');
    };

    // Get the effective salon ID (selected or from user)
    const effectiveSalonId = selectedSalonId || user?.salonId;

    const value = {
        user,
        setUser,
        type: user?.type,
        isAuthenticated,
        loading,
        login,
        logout,
        userSalons,
        selectedSalonId,
        effectiveSalonId,
        switchSalon,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
