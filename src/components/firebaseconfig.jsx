import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBFmMvdXmmh-Y8iFxSTycLGgbtxFlMPBxw",
  authDomain: "book-link-2ee53.firebaseapp.com",
  projectId: "book-link-2ee53",
  storageBucket: "book-link-2ee53.firebasestorage.app",
  messagingSenderId: "853136303233",
  appId: "1:853136303233:web:bccf7093d7c60d857d9980",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
