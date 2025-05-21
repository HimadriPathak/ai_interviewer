// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLihY7Inp7rX-mIBxTwevDfxHMBYjTBzE",
  authDomain: "ai-interviewer-63b8d.firebaseapp.com",
  projectId: "ai-interviewer-63b8d",
  storageBucket: "ai-interviewer-63b8d.firebasestorage.app",
  messagingSenderId: "106059869060",
  appId: "1:106059869060:web:1a953f4f25573179ce0bd1",
  measurementId: "G-125HEJ3GT8",
};
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
