import { Link, useLocation, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { ModeToggle } from "../components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import MYLOGO from "../assets/MYLOGO.png"
import darklogo from "../assets/darklogo.png"
import { auth } from "../firebase"
import { useAuth } from "../context/AuthContext"

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Devices", path: "/devices" },
  { name: "History", path: "/history" },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/login")
  }
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.displayName) return "U"
    return currentUser.displayName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
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

          {!isAuthenticated && !isLoginPage && (
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}

          {!isAuthenticated && isLoginPage && (
            <Button variant="outline" onClick={() => navigate("/register")}>
              Sign Up
            </Button>
          )}

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser?.photoURL} alt={currentUser?.displayName || "User"} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.displayName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/devices")}>Devices</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/history")}>History</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
