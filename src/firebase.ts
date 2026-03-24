import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGNpxcEeobWsOBXSxRYBrJph7UjJAlE80",
  authDomain: "sookmyung-97032.firebaseapp.com",
  projectId: "sookmyung-97032",
  storageBucket: "sookmyung-97032.firebasestorage.app",
  messagingSenderId: "921858570786",
  appId: "1:921858570786:web:04abc78193f6651ff3687b",
  measurementId: "G-DH6D27DDWB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'asia-northeast3');
export const storage = getStorage(app);
