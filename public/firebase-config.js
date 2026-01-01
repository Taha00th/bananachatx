// Firebase yapılandırması
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase yapılandırma objesi
const firebaseConfig = {
  apiKey: "AIzaSyC9JVweNrrypKbSTn9mbVvAUqEyYgjFVxs",
  authDomain: "bananachat-75830.firebaseapp.com",
  projectId: "bananachat-75830",
  storageBucket: "bananachat-75830.firebasestorage.app",
  messagingSenderId: "610695252418",
  appId: "1:610695252418:web:218ab8e566b901cb1bee5b",
  measurementId: "G-EPCFQ6C00S"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Auth ve Firestore servislerini dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;