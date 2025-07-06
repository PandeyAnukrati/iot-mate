import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Lightbulb, Gauge, Settings } from "lucide-react"

export default function Introduction() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen w-full bg-gradient-to-br from-[#f0f4ff] to-[#ffffff] dark:from-[#0e0e11] dark:to-[#121212] text-foreground px-6 py-24 overflow-hidden">
      {/* Glowing Background Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-400 opacity-30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-purple-600 opacity-20 rounded-full blur-2xl animate-pulse" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center space-y-14">
        {/* Welcome Heading */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold leading-tight tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to <span className="text-cyan-500">HousePilot</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Your intelligent companion to manage your entire home from one sleek dashboard. Automate lighting, monitor devices, and live smarter.
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <FeatureCard
            icon={<Lightbulb className="w-8 h-8 text-cyan-500" />}
            title="Smart Lighting"
            desc="Control lights in every room, set moods and automate schedules with ease."
          />
          <FeatureCard
            icon={<Gauge className="w-8 h-8 text-cyan-500" />}
            title="Realtime Dashboard"
            desc="Visualize and control device status, energy use, and security in one glance."
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8 text-cyan-500" />}
            title="Theme Automation"
            desc="Auto-switch light/dark modes based on time or your preferences."
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex justify-center gap-6 flex-wrap mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-6"
            onClick={() => navigate("/dashboard")}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const el = document.getElementById("features")
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Learn More
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

// 🔹 FeatureCard component
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-md p-6 text-left space-y-4 transition-transform hover:scale-[1.03]">
      <div className="flex items-center gap-3">
        <div className="bg-cyan-100 dark:bg-cyan-900 p-2 rounded-full">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  )
}
