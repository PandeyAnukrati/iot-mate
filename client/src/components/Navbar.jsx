import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { ModeToggle } from "../components/mode-toggle"
import { Button } from "@/components/ui/button"
import MYLOGO from "../assets/MYLOGO.png"
import darklogo from "../assets/darklogo.png"
import { auth } from "../firebase" // Make sure this path is correct

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Devices", path: "/devices" },
  { name: "History", path: "/history" },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/login")
  }

  const isLoginPage = location.pathname === "/login"
  const isRegisterPage = location.pathname === "/register"

  return (
    <nav className="w-full px-6 py-4 shadow-sm border-b bg-background text-foreground">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={MYLOGO} alt="HousePilot Logo" className="h-12 w-auto dark:hidden" />
          <img src={darklogo} alt="HousePilot Dark Logo" className="h-12 w-auto hidden dark:block" />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex gap-4 items-center">
          {navLinks.map(link => (
            <Link key={link.name} to={link.path}>
              <Button variant={location.pathname === link.path ? "default" : "ghost"}>
                {link.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <ModeToggle />

          {!user && !isLoginPage && (
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}

          {!user && isLoginPage && (
            <Button variant="outline" onClick={() => navigate("/register")}>
              Sign Up
            </Button>
          )}

          {user && (
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
