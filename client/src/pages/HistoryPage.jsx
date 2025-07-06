import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, Lightbulb, Fan, Thermometer, Shield, PlugZap } from "lucide-react"
import Navbar from "../components/Navbar"

const mockLogs = [
  {
    id: 1,
    icon: Lightbulb,
    title: "Living Room Light Turned Off",
    desc: "User turned off the light in Ground Floor, House 1",
    timestamp: "2025-06-28 20:15",
  },
  {
    id: 2,
    icon: Fan,
    title: "Living Room Fan Speed Changed",
    desc: "Speed changed to level 2 in Ground Floor, House 1",
    timestamp: "2025-06-28 19:40",
  },
  {
    id: 3,
    icon: Lightbulb,
    title: "Bedroom Lamp Turned On",
    desc: "User turned on the lamp in Bedroom, Ground Floor, House 1",
    timestamp: "2025-06-28 18:05",
  },
  {
    id: 4,
    icon: Thermometer,
    title: "Bedroom AC Temperature Set",
    desc: "Temperature set to 24°C in Bedroom, Ground Floor, House 1",
    timestamp: "2025-06-28 17:10",
  },
  {
    id: 5,
    icon: Clock,
    title: "Hall Automation Triggered",
    desc: "Smart Plug and Security Cam activated in Hall, House 2",
    timestamp: "2025-06-27 21:30",
  },
]

export default function HistoryPage() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    setLogs(mockLogs)
  }, [])

  return (
    <>
      <Navbar />
      <section className="relative w-full min-h-screen px-6 py-24 bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-[#0e0e11] dark:to-[#121212] text-foreground">
        {/* Background Blur Effects */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-300 opacity-20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Device Activity History
          </motion.h1>

          <div className="space-y-10">
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                className="relative flex flex-col sm:flex-row sm:items-center gap-6 bg-white/70 dark:bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <div className="flex-shrink-0 bg-cyan-200 dark:bg-cyan-900 p-4 rounded-full">
                  <log.icon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{log.title}</h3>
                  <p className="text-muted-foreground text-sm">{log.desc}</p>
                </div>
                <div className="text-sm text-right text-muted-foreground mt-2 sm:mt-0">
                  <span>{log.timestamp}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
