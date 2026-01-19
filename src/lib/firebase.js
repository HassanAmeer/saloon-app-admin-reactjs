// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//     projectId: "YOUR_PROJECT_ID",
//     storageBucket: "YOUR_PROJECT_ID.appspot.com",
//     messagingSenderId: "YOUR_SENDER_ID",
//     appId: "YOUR_APP_ID"
// };
const firebaseConfig = {
    apiKey: "AIzaSyBLWC0k2M7bV5Rd10rYBkFeV22azt6nkJI",
    authDomain: "saloon-ai2.firebaseapp.com",
    projectId: "saloon-ai2",
    storageBucket: "saloon-ai2.firebasestorage.app",
    messagingSenderId: "933337565383",
    appId: "1:933337565383:web:1ac9927892ba3a96bd16e2",
    measurementId: "G-YZLNZZ6RQE"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
