import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import {  
  getAuth,
  verifyBeforeUpdateEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
  updateDoc 
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";







// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLAHD8YDG2ltckOMfTkfANlxISjdXJyN8",
  authDomain: "femhack-57489.firebaseapp.com",
  projectId: "femhack-57489",
  storageBucket: "femhack-57489.firebasestorage.app",
  messagingSenderId: "111695453720",
  appId: "1:111695453720:web:2b907af536cbc7c779ed6d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  getFirestore,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
  onAuthStateChanged,
  db,
  updateDoc,
  verifyBeforeUpdateEmail
};