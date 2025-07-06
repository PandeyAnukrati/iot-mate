// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyANObZA2zILX0MlRwCEvR0PDfCHXzDgV0I",
  authDomain: "housepilot-520f0.firebaseapp.com",
  projectId: "housepilot-520f0",
  storageBucket: "housepilot-520f0.appspot.com", // fixed .app typo
  messagingSenderId: "226346875093",
  appId: "1:226346875093:web:5cff928c8272722e094a5c",
  measurementId: "G-VF5JYVQ00Z"
}

// ✅ Initialize app
const app = initializeApp(firebaseConfig)

// ✅ Export auth for use in Login/Signup
export const auth = getAuth(app)
