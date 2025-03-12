import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBdfkvD2c3XajAz7jT0toQtsQh3_adBBPE",
    authDomain: "notion-5dcd4.firebaseapp.com",
    projectId: "notion-5dcd4",
    storageBucket: "notion-5dcd4.firebasestorage.app",
    messagingSenderId: "689588704937",
    appId: "1:689588704937:web:f47c1199cb6d1e50c77bb8"
  };
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  export {db};