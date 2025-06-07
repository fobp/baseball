// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ IMPORTANTE
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBK8mdzL7YXzqbBoI_g7KBVgHOnmTj3WIo",
  authDomain: "dropoficial-4d899.firebaseapp.com",
  databaseURL: "https://dropoficial-4d899-default-rtdb.firebaseio.com",
  projectId: "dropoficial-4d899",
  storageBucket: "dropoficial-4d899.appspot.com",
  messagingSenderId: "724222556636",
  appId: "1:724222556636:web:e577395cc922f1c134f719",
  measurementId: "G-FHT8BYWMBB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ Este es el que necesitas exportar
const db = getDatabase(app);

export { auth, db };
