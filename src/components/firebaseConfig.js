import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyASdwHrVFQ5ZzUfNY39lcKZip4c-nXjWys",
  authDomain: "api-premium-citydata.firebaseapp.com",
  projectId: "api-premium-citydata",
  storageBucket: "api-premium-citydata.firebasestorage.app",
  messagingSenderId: "30821232259",
  appId: "1:30821232259:web:66c51ba5e37d3e8ef335b6",
  measurementId: "G-W2RYNDTP0C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email"); // ✅ เพิ่ม scope email

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email"); // ✅ เพิ่ม scope email

export { auth, googleProvider, facebookProvider };
