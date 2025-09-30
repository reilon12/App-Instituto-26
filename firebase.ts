import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmCt7yWP1cPLZZd-mkTlWY4sFDX7hSIIk",
  authDomain: "qr26-c0ca5.firebaseapp.com",
  projectId: "qr26-c0ca5",
  storageBucket: "qr26-c0ca5.firebasestorage.app",
  messagingSenderId: "35373509873",
  appId: "1:35373509873:web:4e5b8f3052544ac94d8d50",
  measurementId: "G-9KHXT4Z91W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
