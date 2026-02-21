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
    });
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

        // 1. Seed Global Super Admins (Protected Seed)
        onProgress({ status: 'seeding', label: 'Super Admins' });
        const adminRef = doc(db, 'super_admin_setting', mockSuperAdmin.id);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            // Only update essential fields to avoid wiping custom existing data like special bio/address
            await setDoc(adminRef, { ...mockSuperAdmin, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            await setDoc(adminRef, { ...mockSuperAdmin, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
        onProgress({ status: 'success', label: 'Super Admins', count: 1 });

        // 2. Seed Global Salon Managers (for login reference)
        onProgress({ status: 'seeding', label: 'Salon Managers' });
        for (const manager of mockSalonManagers) {
            await setDoc(doc(db, 'salon_managers', manager.id), { ...manager, createdAt: serverTimestamp() });
        }
        onProgress({ status: 'success', label: 'Salon Managers', count: mockSalonManagers.length });

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
