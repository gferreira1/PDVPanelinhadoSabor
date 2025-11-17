// firebase/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDimXW0l-O_tmRhNH-WWgZqXGucX3Zk4hc",
  authDomain: "panelinha-fe407.firebaseapp.com",
  projectId: "panelinha-fe407",
  storageBucket: "panelinha-fe407.appspot.com",
  messagingSenderId: "1006485480860",
  appId: "1:1006485480860:web:ded54166d6bfad4f649459",
  measurementId: "G-BM581Q8TKX"
};

// 🔥 Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Inicializa o Firestore
const db = getFirestore(app);

// 🔥 Exporta o banco (NÃO é default!)
export { db };
