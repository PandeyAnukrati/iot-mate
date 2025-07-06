import { motion } from "framer-motion"
import { PlugZap, LayoutDashboard, SlidersHorizontal } from "lucide-react"

const steps = [
  {
    title: "Connect Your Home",
    icon: <PlugZap className="w-6 h-6 text-cyan-500" />,
    desc: "Add virtual rooms and devices in just a few clicks. No hardware required — simulate everything online.",
  },
  {
    title: "Monitor & Customize",
    icon: <LayoutDashboard className="w-6 h-6 text-cyan-500" />,
    desc: "Organize your space by rooms, customize layouts, and monitor real-time device states from a sleek dashboard.",
  },
  {
    title: "Control & Automate",
    icon: <SlidersHorizontal className="w-6 h-6 text-cyan-500" />,
    desc: "Set daily schedules, voice triggers, or theme-based automations to control your smart environment effortlessly.",
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full py-24 px-6 bg-background text-foreground relative"
    >
      <div className="max-w-4xl mx-auto space-y-16">
        <motion.h2
          className="text-center text-4xl md:text-5xl font-bold"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          How HousePilot Works
        </motion.h2>

        <div className="relative border-l-2 border-cyan-500 dark:border-cyan-400 pl-6 space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <span className="absolute -left-[1.45rem] top-1 w-8 h-8 bg-background border-2 border-cyan-500 dark:border-cyan-400 rounded-full flex items-center justify-center shadow-md">
                {step.icon}
              </span>
              <div className="ml-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-lg">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

