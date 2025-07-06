import { Link } from "react-router-dom"
import { Github, Instagram, Linkedin } from "lucide-react"
import MYLOGO from "../assets/MYLOGO.png"

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t py-10 px-6 text-foreground">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

        {/* Logo + Slogan */}
        <div className="flex items-center gap-4">
          <img src={MYLOGO} alt="HousePilot" className="h-10 w-auto" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold">HousePilot</p>
            <p className="text-xs">Smart Living. Seamlessly Controlled.</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/devices" className="hover:underline">Devices</Link>
          <Link to="/history" className="hover:underline">History</Link>
          <a href="#features" className="hover:underline">Features</a>
        </div>

        {/* Social Icons */}
        <div className="flex gap-4">
          <a href="https://github.com/PandeyAnukrati" target="_blank" rel="noreferrer">
            <Github className="w-5 h-5 hover:text-cyan-500" />
          </a>
          <a href="https://instagram.com/yourprofile" target="_blank" rel="noreferrer">
            <Instagram className="w-5 h-5 hover:text-pink-500" />
          </a>
          <a href="https://www.linkedin.com/in/anukrati-pandey-92274a2a9/" target="_blank" rel="noreferrer">
            <Linkedin className="w-5 h-5 hover:text-blue-600" />
          </a>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HousePilot. Built with 💡 by Anukrati Pandey.
      </div>
    </footer>
  )
}
