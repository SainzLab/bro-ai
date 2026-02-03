import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHgM-J88XU6zXqYlcG7jUkAVUy8MmBDqU",
  authDomain: "sainzlab-chat.firebaseapp.com",
  projectId: "sainzlab-chat",
  storageBucket: "sainzlab-chat.firebasestorage.app",
  messagingSenderId: "399320905942",
  appId: "1:399320905942:web:20aa894098f5821fa6b177",
  measurementId: "G-1VX3TH7JLS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };