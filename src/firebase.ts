import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCejh0GSpSDpaUgBew84u13MVIOFvPkK0s",
  authDomain: "indian-social-media-d422b.firebaseapp.com",
  projectId: "indian-social-media-d422b",
  storageBucket: "indian-social-media-d422b.firebasestorage.app",
  messagingSenderId: "391399808689",
  appId: "1:391399808689:web:4b9a3a0e64eb3ec5ed0c90",
  measurementId: "G-VFXDP7VMRR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const googleProvider = new GoogleAuthProvider();
