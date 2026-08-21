import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-GIQBnXx-oP4pG4O0PuDmvxWxpkTigZk",
  authDomain: "pdf-concurso-edu.firebaseapp.com",
  projectId: "pdf-concurso-edu",
  storageBucket: "pdf-concurso-edu.firebasestorage.app",
  messagingSenderId: "314121207816",
  appId: "1:314121207816:web:4a32b3f04f8e4ae58651bd",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

