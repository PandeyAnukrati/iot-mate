import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronDown } from 'lucide-react';

// --- Import the new background image ---
import heroBackgroundImage from "../assets/hero.jpg"; // <--- This is the image you uploaded


export default function HeroSection() {
  const navigate = useNavigate();

  // Framer Motion variants for subtle entrance animations
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.0, ease: "easeOut" } },
  };

  const slideInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Function to handle scrolling down to the next section
  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        // --- Updated to use your hero.jpg ---
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
        {/* Semi-transparent overlay to make text more readable */}
        {/* Adjust opacity of this overlay if the new background image makes text hard to read */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Central Content (Your HousePilot Text Adapted) */}
      <div className="relative z-10 text-center px-6 pt-20 pb-16 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base font-semibold tracking-widest uppercase text-white/80 mb-4"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          HOUSEPILOT
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-wide"
          variants={slideInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          THE MOST <span className="italic font-normal">civilized</span> WAY
          <br /> TO GET <span className="text-cyan-500">THERE</span>
        </motion.h1>

        {/* Original HousePilot Tagline (repurposed as a secondary message) */}
        <motion.p
          className="text-lg md:text-xl mt-6 text-white/80 max-w-2xl"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        >
          Control your smart devices, lights, environment, and automations — all from a single intuitive dashboard.
        </motion.p>

        {/* Scroll Down Indicator */}
        <motion.button
          onClick={handleScrollDown}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30 text-white hover:bg-white/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeOut" }}
        >
          <ChevronDown className="h-8 w-8" />
        </motion.button>
      </div>
    </section>
  );
}