// src/services/firebase.ts
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDYu25YQWz4KP6obgfmzfan8V01c9EXJlo",
  authDomain: "green-guardian-web.firebaseapp.com",
  projectId: "green-guardian-web",
  storageBucket: "green-guardian-web.firebasestorage.app",
  messagingSenderId: "339869409951",
  appId: "1:339869409951:web:183849849300e5c9d738aa",
  measurementId: "G-QGEF3WLCZV"
};

let app: FirebaseApp;
let auth: Auth;

if (getApps().length) {
  app = getApp();
  auth = getAuth(app);
} else {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// 🚨 QUAN TRỌNG: phải export auth dạng named export
export { app, auth, db, storage };
