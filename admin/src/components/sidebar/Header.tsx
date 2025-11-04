"use client"

import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"

interface HeaderProps {
  isCollapsed: boolean
  isOpenMobile: boolean
  isMobile: boolean
  onToggle: () => void
}

export default function Header({ isCollapsed, isOpenMobile, isMobile, onToggle }: HeaderProps) {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-3 lg:gap-4">
      {/* Burger Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        className="p-2.5 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                   transition-colors bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 
                   text-slate-300 border border-slate-800/50 shadow-lg backdrop-blur-sm"
        aria-label={
          isMobile ? (isOpenMobile ? "Close menu" : "Open menu") : isCollapsed ? "Expand sidebar" : "Collapse sidebar"
        }
        aria-expanded={isMobile ? isOpenMobile : !isCollapsed}
      >
        {isMobile ? (
          isOpenMobile ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )
        ) : isCollapsed ? (
          <Menu size={20} />
        ) : (
          <X size={20} />
        )}
      </motion.button>

      {/* Logo */}
      <motion.div
        initial={false}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        className="relative flex items-center justify-center font-bold text-white
                   w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 via-blue-600 to-purple-600
                   shadow-lg border border-blue-400/30"
      >
        DB
      </motion.div>

      {/* Company Name */}
      <motion.div
        initial={false}
        animate={{ opacity: isMobile ? 0 : 1, display: isMobile ? "none" : "block" }}
        transition={{ duration: 0.2 }}
        className="text-xs font-semibold tracking-tight text-white hidden lg:block"
      >
        DylanBiotech
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  )
}
