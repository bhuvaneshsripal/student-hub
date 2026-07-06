import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDORR_Ihf74--PZlbVaAeq5KaGd-k0wIrc",
  authDomain: "studo-07.firebaseapp.com",
  projectId: "studo-07",
  storageBucket: "studo-07.firebasestorage.app",
  messagingSenderId: "1003318897037",
  appId: "1:1003318897037:web:d85b8b26a2f80384c275c4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();