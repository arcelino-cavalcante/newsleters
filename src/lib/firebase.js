import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBejMOF5GkaFwpDfQi2QOPaXMeNLWUSHvk",
    authDomain: "newslwtters-d8284.firebaseapp.com",
    projectId: "newslwtters-d8284",
    storageBucket: "newslwtters-d8284.firebasestorage.app",
    messagingSenderId: "457827495024",
    appId: "1:457827495024:web:553b67392739f737cc18b5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
