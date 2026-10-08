import {
    collection,
    collectionGroup,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs,
    getDoc,
    orderBy,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { uploadChunkedBase64 } from './file-upload';

// Helper for real-time collection updates
export const subscribeToCollection = (collectionPath, callback, filters = [], sort = null) => {
    let ref = collection(db, collectionPath);
    let queryRef = query(ref);

    filters.forEach(f => {
        queryRef = query(queryRef, where(f.field, f.operator, f.value));
    });

    if (sort) {
        queryRef = query(queryRef, orderBy(sort.field, sort.direction));
    }

    return onSnapshot(queryRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => {
        console.warn(`Firestore subscription error on [${collectionPath}]:`, error.message);
        callback([]);
    });
};

// Helper for real-time document updates
export const subscribeToDocument = (collectionPath, docId, callback) => {
    const docRef = doc(db, collectionPath, docId);
    return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() });
        } else {
            callback(null);
        }
    }, (error) => {
        console.warn(`Firestore document error on [${collectionPath}/${docId}]:`, error.message);
        callback(null);
    });
};

// Helper for collectionGroup updates (for deep nested data like recommendations)
export const subscribeToCollectionGroup = (collectionId, callback, filters = [], sort = null) => {
    let q = query(collectionGroup(db, collectionId));

    filters.forEach(f => {
        q = query(q, where(f.field, f.operator, f.value));
    });

    if (sort) {
        q = query(q, orderBy(sort.field, sort.direction));
    }

    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => {
        console.warn(`Firestore collectionGroup error on [${collectionId}]:`, error.message);
        callback([]);
    });
};

// Check if email already exists in salon_managers or stylists collections
export const checkEmailExists = async (email, excludeId = null) => {
    try {
        // Check salon_managers collection
        const managersRef = collection(db, 'salon_managers');
        const managersQuery = query(managersRef, where('email', '==', email));
        const managersSnap = await getDocs(managersQuery);
        
        for (const doc of managersSnap.docs) {
            if (doc.id !== excludeId) {
                return { exists: true, collection: 'salon_managers', data: { id: doc.id, ...doc.data() } };
            }
        }

        // Check stylists collection group (across all salons)
        const stylistsQuery = query(collectionGroup(db, 'stylists'), where('email', '==', email));
        const stylistsSnap = await getDocs(stylistsQuery);
        
        for (const doc of stylistsSnap.docs) {
            if (doc.id !== excludeId) {
                return { exists: true, collection: 'stylists', data: { id: doc.id, ...doc.data() } };
            }
        }

        // Check super_admin_setting
        const adminRef = doc(db, 'super_admin_setting', 'settings');
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists() && adminSnap.data().email === email && adminSnap.id !== excludeId) {
            return { exists: true, collection: 'super_admin_setting', data: { id: adminSnap.id, ...adminSnap.data() } };
        }

        return { exists: false };
    } catch (error) {
        console.error("Error checking email existence:", error);
        return { exists: false, error: error.message };
    }
};

// Generic CRUD operations
export const createDocument = async (collectionName, data) => {
    return await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

export const updateDocument = async (collectionName, docId, data) => {
    const docRef = doc(db, collectionName, docId);
    return await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteDocument = async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    return await deleteDoc(docRef);
};

export const getDocument = async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
};

// Audit trail logging
export const logAudit = async (action, details, userId, salonId) => {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            action,
            details,
            userId,
            salonId,
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Audit log error:', error);
    }
};

// Stock correction
export const correctStock = async (productId, newStock, salonId) => {
    try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
            return { success: false, error: 'Product not found' };
        }

        await updateDoc(productRef, {
            inventory: Math.max(0, newStock),
            stockCorrectedAt: serverTimestamp(),
            stockCorrectedBy: salonId
        });

        return { success: true };
    } catch (error) {
        console.error("Error correcting stock:", error);
        return { success: false, error: error.message };
    }
};

// Refund a sale
export const refundSale = async (saleId, reason, salonId) => {
    try {
        const saleRef = doc(db, 'sales', saleId);
        const saleSnap = await getDoc(saleRef);
        
        if (!saleSnap.exists()) {
            return { success: false, error: 'Sale not found' };
        }

        const saleData = saleSnap.data();

        await updateDoc(saleRef, {
            status: 'refunded',
            refundReason: reason,
            refundDate: new Date().toISOString().split('T')[0],
            refundTimestamp: serverTimestamp()
        });

        if (saleData.products && saleData.products.length > 0) {
            for (const product of saleData.products) {
                if (product.id) {
                    const productRef = doc(db, 'products', product.id);
                    const productSnap = await getDoc(productRef);
                    if (productSnap.exists()) {
                        const currentStock = productSnap.data().inventory || 0;
                        await updateDoc(productRef, {
                            inventory: currentStock + product.quantity,
                            unitsSold: Math.max(0, (productSnap.data().unitsSold || 0) - product.quantity),
                            updatedAt: serverTimestamp()
                        });
                    }
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error refunding sale:", error);
        return { success: false, error: error.message };
    }
};

// Cancel a sale
export const cancelSale = async (saleId, reason, salonId) => {
    try {
        const saleRef = doc(db, 'sales', saleId);
        const saleSnap = await getDoc(saleRef);
        
        if (!saleSnap.exists()) {
            return { success: false, error: 'Sale not found' };
        }

        const saleData = saleSnap.data();

        await updateDoc(saleRef, {
            status: 'cancelled',
            cancelReason: reason,
            cancelDate: new Date().toISOString().split('T')[0],
            cancelTimestamp: serverTimestamp()
        });

        if (saleData.products && saleData.products.length > 0) {
            for (const product of saleData.products) {
                if (product.id) {
                    const productRef = doc(db, 'products', product.id);
                    const productSnap = await getDoc(productRef);
                    if (productSnap.exists()) {
                        const currentStock = productSnap.data().inventory || 0;
                        await updateDoc(productRef, {
                            inventory: currentStock + product.quantity,
                            unitsSold: Math.max(0, (productSnap.data().unitsSold || 0) - product.quantity),
                            updatedAt: serverTimestamp()
                        });
                    }
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error cancelling sale:", error);
        return { success: false, error: error.message };
    }
};

// Helper to convert File to Base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Get only the base64 part
    reader.onerror = error => reject(error);
});

// Image Upload using Chunked API
export const uploadImage = async (file, path) => {
    if (!file) return null;
    try {
        const base64 = await fileToBase64(file);
        const result = await uploadChunkedBase64(base64);
        console.log("Upload Result:", result); // Debugging

        if (!result) return null;

        // Check for common URL fields
        const url = result.link || result.file_url || result.url || result.data?.file_url || result.data?.url;

        if (!url) {
            console.error("No URL found in upload response:", result);
            return null;
        }

        return url;
    } catch (error) {
        console.error("Error in chunked upload:", error);
        return null;
    }
};

// Initialize Database with Mock Data (Multi-Tenant Nested Pattern)
export const initializeData = async (mockData, onProgress = () => { }) => {
    try {
        const {
            mockStylists,
            mockProducts,
            mockSales,
            mockAIRecommendations,
            mockSuperAdmin,
            mockSalonManagers,
            mockSalons,
            mockConfig,
            mockConfigs,
            mockClients
        } = mockData;

        // 1. Seed Global Platform Owners (Protected Seed)
        onProgress({ status: 'seeding', label: 'Platform Owners' });
        const adminRef = doc(db, 'super_admin_setting', mockSuperAdmin.id);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            // Only update essential fields to avoid wiping custom existing data like special bio/address
            await setDoc(adminRef, { ...mockSuperAdmin, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            await setDoc(adminRef, { ...mockSuperAdmin, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
        onProgress({ status: 'success', label: 'Platform Owners', count: 1 });

        // 2. Seed Global Salon Owners (for login reference)
        onProgress({ status: 'seeding', label: 'Salon Owners' });
        for (const manager of mockSalonManagers) {
            await setDoc(doc(db, 'salon_managers', manager.id), { ...manager, createdAt: serverTimestamp() });
        }
        onProgress({ status: 'success', label: 'Salon Owners', count: mockSalonManagers.length });

        // 3. Seed Global Platform Config
        onProgress({ status: 'seeding', label: 'Platform Config' });
        await setDoc(doc(db, 'settings', 'platform_config'), { ...mockConfig, updatedAt: serverTimestamp() });
        onProgress({ status: 'success', label: 'Platform Config', count: 1 });

        // 4. Seed Nested Salon Structure
        const salons = mockSalons || [];
        let salonIndex = 0;
        for (const salon of salons) {
            salonIndex++;
            onProgress({ status: 'seeding', label: `Salon: ${salon.name}`, current: salonIndex, total: salons.length });
            const salonPath = `salons/${salon.id}`;
            const salonRef = doc(db, salonPath);

            // A. Salon Profile Doc (Root + Profile Sub-resource)
            await setDoc(salonRef, { ...salon, createdAt: serverTimestamp() });
            await setDoc(doc(db, `${salonPath}/settings`, 'profile'), { ...salon, updatedAt: serverTimestamp() });

            // B. App Config (salons/{id}/settings/app_config)
            const salonConfig = (mockConfigs && mockConfigs[salon.id]) ? mockConfigs[salon.id] : mockConfig;
            await setDoc(doc(db, `salons/${salon.id}/settings`, 'app_config'), { ...salonConfig, updatedAt: serverTimestamp() });

            // C. Products Subcollection
            onProgress({ status: 'seeding', label: `Products: ${salon.name}` });
            const salonProds = mockProducts.filter(p => p.salonId === salon.id);
            for (const product of salonProds) {
                await setDoc(doc(db, `salons/${salon.id}/products`, product.id), { ...product, createdAt: serverTimestamp() });
            }
            onProgress({ status: 'success', label: `Products: ${salon.name}`, count: salonProds.length });

            // D. Sales Subcollection
            onProgress({ status: 'seeding', label: `Sales: ${salon.name}` });
            const salonSales = mockSales.filter(s => s.salonId === salon.id);
            for (const sale of salonSales) {
                await setDoc(doc(db, `salons/${salon.id}/sales`, sale.id), { ...sale, createdAt: serverTimestamp() });
            }
            onProgress({ status: 'success', label: `Sales: ${salon.name}`, count: salonSales.length });

            // E. Stylists & Nested Data
            onProgress({ status: 'seeding', label: `Team: ${salon.name}` });
            const salonStylists = mockStylists.filter(s => s.salonId === salon.id);
            for (const stylist of salonStylists) {
                const stylistPath = `${salonPath}/stylists/${stylist.id}`;

                // Root stylist doc + profile sub-doc
                await setDoc(doc(db, `${salonPath}/stylists`, stylist.id), { ...stylist, createdAt: serverTimestamp() });
                await setDoc(doc(db, `${stylistPath}/profile`, 'data'), { ...stylist, updatedAt: serverTimestamp() });

                // Nested Clients under Stylist
                const stylistClients = mockClients.filter(c => c.stylistId === stylist.id);
                for (const client of stylistClients) {
                    await setDoc(doc(db, `${stylistPath}/clients`, client.id), { ...client, createdAt: serverTimestamp() });
                }

                // Nested AI Recommendations under Stylist
                const stylistRecs = mockAIRecommendations.filter(r => r.stylistId === stylist.id);
                for (const rec of stylistRecs) {
                    await setDoc(doc(db, `${stylistPath}/Ai recommendations`, rec.id), { ...rec, createdAt: serverTimestamp() });
                }
            }
            onProgress({ status: 'success', label: `Team: ${salon.name}`, count: salonStylists.length });
        }

        onProgress({ status: 'success', label: 'Database Initialization', count: 1 });
        onProgress({ status: 'complete' });
    } catch (error) {
        onProgress({ status: 'error', error: error.message });
        console.error("❌ [Firebase] Critical initialization error:", error);
    }
};
