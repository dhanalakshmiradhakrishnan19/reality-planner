import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGCDxeMcttXZj1wXUKUW-T2Nrm4ZFuY4U",
  authDomain: "reality-planner-b4a9c.firebaseapp.com",
  projectId: "reality-planner-b4a9c",
  storageBucket: "reality-planner-b4a9c.firebasestorage.app",
  messagingSenderId: "869089937149",
  appId: "1:869089937149:web:2b9fc89990a426ba232094"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);