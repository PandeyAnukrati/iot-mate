import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "../firebase"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"

// Create the authentication context
const AuthContext = createContext()

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext)
}

// Provider component that wraps the app and makes auth object available to any child component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get token when user changes
  useEffect(() => {
    const getToken = async () => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken(true);
          setToken(idToken);
        } catch (error) {
          console.error("Error getting token:", error);
          toast.error("Authentication error. Please try logging in again.");
          setToken(null);
        }
      } else {
        setToken(null);
      }
    };

    getToken();
  }, [currentUser]);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
      
      if (user) {
        toast.success(`Welcome, ${user.displayName || user.email}!`);
      }
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  // Value object that will be passed to consumers
  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser && !!token,
    user: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL
    } : null
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}