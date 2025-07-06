import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Do I need physical IoT devices to use HousePilot?",
    answer: "No, HousePilot simulates smart devices virtually. You can create rooms, add devices, and control them — all in the app without hardware."
  },
  {
    question: "Can I control devices based on time or theme?",
    answer: "Absolutely. You can schedule automations to switch devices on/off based on time, or sync light/dark mode with real-time theme changes."
  },
  {
    question: "Is HousePilot secure for multiple users?",
    answer: "Yes, we use mock session handling and user authentication to simulate secure environments. You can extend it to real auth in production."
  },
  {
    question: "Can I simulate voice commands?",
    answer: "Yes! Our voice assistant module lets you simulate basic commands like 'Turn off lights' or 'Activate sleep mode'."
  }
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="w-full py-24 px-6 bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.h2
          className="text-center text-4xl md:text-5xl font-bold"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-muted rounded-xl p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => toggle(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-md md:text-lg font-medium">{faq.question}</h3>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.span>
              </div>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.p
                    className="mt-3 text-sm text-muted-foreground"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
