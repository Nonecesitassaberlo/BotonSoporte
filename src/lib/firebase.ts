import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Reemplaza esto con la configuración de tu proyecto de Firebase
// 1. Ve a la Consola de Firebase > Configuración del proyecto > General
// 2. Baja hasta "Tus apps" y añade una app Web (ícono de </>)
// 3. Copia el objeto firebaseConfig y pégalo aquí:
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD7DUYO37c9nN7nwBGt90qfA6okIWkMGAc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "boton-soporte.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "boton-soporte",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "boton-soporte.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "777021489428",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:777021489428:web:f334dcbf5afd49dff48201"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
