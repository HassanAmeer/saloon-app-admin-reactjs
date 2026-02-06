import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { uploadChunkedBase64 } from './file-upload';

// Helper for real-time collection updates
export const subscribeToCollection = (collectionName, callback, filters = [], sort = null) => {
    let q = collection(db, collectionName);

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

// Initialize Database with Mock Data
export const initializeData = async (mockData, onProgress = () => { }) => {
    try {
        const {
            mockStylists,
            mockProducts,
            mockSales,
            mockAIRecommendations,
            mockAdmin,
            mockConfig,
            mockClients
        } = mockData;

        const collections = [
            { name: 'stylists', data: mockStylists, label: 'Stylists' },
            { name: 'products', data: mockProducts, label: 'Products' },
            { name: 'sales', data: mockSales, label: 'Sales' },
            { name: 'recommendations', data: mockAIRecommendations, label: 'AI Recommendations' },
            { name: 'admins', data: [mockAdmin], label: 'Admin Users' },
            { name: 'settings', data: [{ id: 'app_config', ...mockConfig }], label: 'App Settings' },
            { name: 'clients', data: mockClients, label: 'Clients' }
        ];

        for (const coll of collections) {
            onProgress({ status: 'seeding', label: coll.label, count: coll.data.length });

            try {
                for (const item of (coll.data || [])) {
                    const { id, ...itemData } = item;
                    const docId = id?.toString() || Math.random().toString(36).substring(7);

                    await setDoc(doc(db, coll.name, docId), {
                        ...itemData,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
                onProgress({ status: 'success', label: coll.label, count: coll.data.length });
            } catch (e) {
                console.error(`❌ [Firebase] Error seeding ${coll.name}:`, e.message);
                onProgress({ status: 'error', label: coll.label, error: e.message });
            }
        }
        onProgress({ status: 'complete' });
    } catch (error) {
        onProgress({ status: 'error', error: error.message });
        console.error("❌ [Firebase] Critical initialization error:", error);
    }
};
