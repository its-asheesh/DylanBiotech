"use client"

import type React from "react"

import { NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

export interface SidebarItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isCollapsed: boolean
  onClick?: () => void
}

export default function SidebarItem({ to, icon, label, isCollapsed, onClick }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center justify-center lg:justify-start w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-linear-to-r from-blue-600/80 to-blue-500/60 text-white shadow-lg shadow-blue-600/20"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
        }`
      }
    >
      <motion.span
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="shrink-0 text-lg flex items-center justify-center"
      >
        {icon}
      </motion.span>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
            animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="font-medium text-sm truncate text-inherit"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {isCollapsed && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            whileHover={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-full top-1/2 ml-3 hidden group-hover:block
                       px-2.5 py-1.5 bg-slate-800 text-slate-100 text-xs rounded-md whitespace-nowrap z-10
                       pointer-events-none shadow-lg border border-slate-700/50 backdrop-blur-sm"
            style={{ transform: "translateY(-50%)" }}
          >
            {label}
          </motion.div>
        </AnimatePresence>
      )}
    </NavLink>
  )
}
