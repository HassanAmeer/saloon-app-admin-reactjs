/**
 * Saloon App-Side API Layer
 * This module provides abstract functions for the mobile/client-side 
 * implementation, hiding the underlying Firebase logic.
 */

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

/** ==========================================
 * PRODUCT APIs (Full CRUD)
 * ========================================== */

/**
 * Fetch all active products for the recommendation engine
 */
export const getProductCatalog = async () => {
    try {
        const q = query(
            collection(db, 'products'),
            where('status', '==', 'active'),
            orderBy('category')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("API Error [getProductCatalog]:", error);
        throw error;
    }
};

/**
 * Update product stock or details
 */
export const updateProduct = async (productId, data) => {
    try {
        const docRef = doc(db, 'products', productId);
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        console.error("API Error [updateProduct]:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete product from catalog
 */
export const deleteProduct = async (productId) => {
    try {
        await deleteDoc(doc(db, 'products', productId));
        return { success: true };
    } catch (error) {
        console.error("API Error [deleteProduct]:", error);
        return { success: false, error: error.message };
    }
};

/** ==========================================
 * STYLIST APIs (Full CRUD)
 * ========================================== */

/**
 * Fetch all active stylists for session selection
 */
export const getActiveStylists = async () => {
    try {
        const q = query(collection(db, 'stylists'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("API Error [getActiveStylists]:", error);
        throw error;
    }
};

/**
 * Update stylist profile
 */
export const updateStylist = async (stylistId, data) => {
    try {
        const docRef = doc(db, 'stylists', stylistId);
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        console.error("API Error [updateStylist]:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Deactivate a stylist by setting their status to 'inactive'
 */
export const deactivateStylist = async (stylistId) => {
    try {
        const docRef = doc(db, 'stylists', stylistId);
        await updateDoc(docRef, { status: 'inactive', updatedAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        console.error("API Error [deactivateStylist]:", error);
        return { success: false, error: error.message };
    }
};

/** ==========================================
 * RECOMMENDATION APIs (AI ENGINE)
 * ========================================== */

/**
 * Submit a new AI recommendation session
 * @param {Object} recommendationData - The analysis and suggested products
 */
export const saveAIRecommendation = async (recommendationData) => {
    try {
        const docRef = await addDoc(collection(db, 'recommendations'), {
            ...recommendationData,
            createdAt: serverTimestamp(),
            sessionId: `SES-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("API Error [saveAIRecommendation]:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch recent recommendations for a specific client
 */
export const getClientHistory = async (clientName) => {
    try {
        const q = query(
            collection(db, 'recommendations'),
            where('clientName', '==', clientName),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("API Error [getClientHistory]:", error);
        throw error;
    }
};

/** ==========================================
 * SALES & TRACKING APIs
 * ========================================== */

/**
 * Record a sale from the app side
 */
export const recordSale = async (saleData) => {
    try {
        // 1. Add to sales collection
        const saleRef = await addDoc(collection(db, 'sales'), {
            ...saleData,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            timestamp: serverTimestamp()
        });

        // 2. (Optional) In a real app, you would also update product stock here

        return { success: true, saleId: saleRef.id };
    } catch (error) {
        console.error("API Error [recordSale]:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete a sale record (Developer use only)
 */
export const deleteSale = async (saleId) => {
    try {
        await deleteDoc(doc(db, 'sales', saleId));
        return { success: true };
    } catch (error) {
        console.error("API Error [deleteSale]:", error);
        return { success: false, error: error.message };
    }
};

/** ==========================================
 * AUTH & PROFILE APIs
 * ========================================== */

/**
 * Fetch stylist profile by ID
 */
export const getStylistProfile = async (stylistId) => {
    try {
        const docSnap = await getDoc(doc(db, 'stylists', stylistId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("API Error [getStylistProfile]:", error);
        throw error;
    }
};
