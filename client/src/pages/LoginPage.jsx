import Navbar from "../components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase" // 🔐 Your Firebase setup
import { useAuth } from "../context/AuthContext"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard"
  
  // If user is already authenticated, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Navigate to the page they were trying to access or dashboard
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <section className="relative w-full min-h-[90vh] bg-gradient-to-br from-cyan-100 to-white dark:from-[#0e0e11] dark:to-[#121212] text-foreground flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-400 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-purple-600 opacity-20 rounded-full blur-2xl animate-pulse" />

        <div className="relative z-10 max-w-md w-full bg-white/70 dark:bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl">
          <motion.h2
            className="text-3xl font-bold text-center mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Login to <span className="text-cyan-500">HousePilot</span>
          </motion.h2>
          
          {location.state?.from && (
            <motion.div 
              className="mb-6 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md text-amber-800 dark:text-amber-200 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              You need to be logged in to access this page.
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-cyan-500 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </section>
    </>
  )
}
