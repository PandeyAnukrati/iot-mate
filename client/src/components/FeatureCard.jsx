import { motion } from "framer-motion"
import { Mic, Bell, Settings, Shield, Home, Wifi } from "lucide-react"

const features = [
  {
    icon: <Settings className="w-8 h-8 text-cyan-500" />,
    title: "Scene Presets",
    desc: "Create and activate custom scenes like 'Work Mode' or 'Sleep Time' to instantly change lighting and device states."
  },
  {
    icon: <Mic className="w-8 h-8 text-cyan-500" />,
    title: "Voice Assistant Integration",
    desc: "Control your devices with simulated voice commands for a more immersive smart home experience."
  },
  {
    icon: <Bell className="w-8 h-8 text-cyan-500" />,
    title: "Smart Notifications",
    desc: "Receive instant updates when a device goes offline, exceeds usage, or when automations are triggered."
  },
  {
    icon: <Shield className="w-8 h-8 text-cyan-500" />,
    title: "Secure Control",
    desc: "Encrypted and private device management with multi-user access control."
  },
  {
    icon: <Home className="w-8 h-8 text-cyan-500" />,
    title: "Room Customization",
    desc: "Organize devices by room, group them together, and toggle with one click."
  },
  {
    icon: <Wifi className="w-8 h-8 text-cyan-500" />,
    title: "Device Connectivity",
    desc: "Connect virtual IoT devices without hardware for complete simulation."
  }
]

export default function FeatureCardSection() {
  return (
    <section
      id="features"
      className="relative w-full py-24 px-6 bg-background text-foreground"
    >
      <div className="max-w-7xl mx-auto text-center space-y-8">
        <motion.h2
          className="text-4xl md:text-5xl font-bold"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Why HousePilot?
        </motion.h2>
        <motion.p
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Explore powerful features that help you take full control of your smart home — from scenes and alerts to multi-room setup and more.
        </motion.p>

        {/* Grid of Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm p-6 text-left space-y-4 hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="flex items-center gap-4">
                <div className="bg-cyan-100 dark:bg-cyan-900 p-2 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
