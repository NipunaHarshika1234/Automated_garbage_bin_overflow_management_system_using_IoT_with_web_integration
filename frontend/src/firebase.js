import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDPOnf1wTRPCFo0EY1JTcL-XzK1L93TlOw",
  authDomain: "garbage-mgt-system.firebaseapp.com",
  databaseURL: "https://garbage-mgt-system-default-rtdb.firebaseio.com",
  projectId: "garbage-mgt-system",
  storageBucket: "garbage-mgt-system.firebasestorage.app",
  messagingSenderId: "201940984925",
  appId: "1:201940984925:web:339933a06c7d3f8f4a19b4",
  measurementId: "G-K281FRLS77"
};

const app = initializeApp(firebaseConfig);

// Initialize analytics safely
export let analytics;
isSupported().then(supported => {
  if (supported) analytics = getAnalytics(app);
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
