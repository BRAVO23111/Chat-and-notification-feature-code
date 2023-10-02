// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import{getAuth,GoogleAuthProvider} from 'firebase/auth'
import{getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4-D12PG68CsA_iai9oSV_YBMrMjgxqbY",
  authDomain: "chatapp-9eea6.firebaseapp.com",
  projectId: "chatapp-9eea6",
  storageBucket: "chatapp-9eea6.appspot.com",
  messagingSenderId: "417956161304",
  appId: "1:417956161304:web:6156cff6a8b167977c606d",
  measurementId: "G-FCMYR8PEZ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const Provider = new GoogleAuthProvider();
export const db = new getFirestore(app);