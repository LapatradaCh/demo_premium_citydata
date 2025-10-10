import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { doc } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyDneYf7SUAAooViXeQU5ihU-X-BO_JA0d8",
  authDomain: "db-citydata--login.firebaseapp.com",
  projectId: "db-citydata--login",
  storageBucket: "db-citydata--login.firebasestorage.app",
  messagingSenderId: "498235395733",
  appId: "1:498235395733:web:b2438f543e622b27d4559c",
  measurementId: "G-ZYLFQY7QQY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };