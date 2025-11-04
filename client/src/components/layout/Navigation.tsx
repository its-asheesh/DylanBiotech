"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  Menu as MenuIcon,
  Person,
  ShoppingCart,
  Favorite,
  Settings,
  Logout as LogoutIcon,
  Close as CloseIcon,
  ChevronRight,
  AdminPanelSettings,
} from "@mui/icons-material"
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Fade,
  Slide,
  Chip,
} from "@mui/material"

const Navigation: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register"

  // Close drawer when route changes
  useEffect(() => {
    setProfileDrawerOpen(false)
  }, [location.pathname])

  // Check if a link is active
  const isActive = (path: string) => location.pathname === path

  // Navigation items
  const navItems = [
    { name: "Products", path: "/" },
    ...(user?.role === "admin" ? [{ name: "Categories", path: "/categories" }] : []),
  ]

  const userItems = user
    ? [
        { name: "Profile", path: "/profile?tab=profile", icon: <Person /> },
        { name: "My Orders", path: "/profile?tab=orders", icon: <ShoppingCart /> },
        { name: "Favorites", path: "/profile?tab=favorites", icon: <Favorite /> },
        { name: "Settings", path: "/profile?tab=settings", icon: <Settings /> },
        ...(user.role === "admin" ? [{ name: "Admin Panel", path: "/admin", icon: <AdminPanelSettings /> }] : []),
      ]
    : []

  // Handle tab navigation with URL parameters
  const handleTabClick = (path: string) => {
    navigate(path)
    setProfileDrawerOpen(false)
  }

  // Handle logout from profile drawer
  const handleLogout = () => {
    setProfileDrawerOpen(false)
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/")
    }
  }

  const renderProfileDrawer = () => (
    <Drawer
      anchor="right"
      open={profileDrawerOpen}
      onClose={() => setProfileDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: "85%", sm: "340px" },
          maxWidth: "400px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.3)",
        },
      }}
      transitionDuration={400}
    >
      {user && (
        <Box sx={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
          {/* Close button */}
          <IconButton
            onClick={() => setProfileDrawerOpen(false)}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(139, 92, 246, 0.35)",
                transform: "rotate(90deg)",
              },
              transition: "all 0.3s ease",
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Fade in={profileDrawerOpen} timeout={600}>
            <Box
              sx={{
                p: 4,
                pb: 3,
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar
                  src={
                    
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=ffffff&bold=true`
                  }
                  sx={{
                    width: 80,
                    height: 80,
                    border: "3px solid rgba(139, 92, 246, 0.5)",
                    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.08)",
                    },
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: "white", mb: 0.5, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  {user.role === "admin" && (
                    <Chip
                      label="Admin"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(139, 92, 246, 0.3)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: "20px",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(139, 92, 246, 0.5)",
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  backgroundColor: "rgba(139, 92, 246, 0.15)",
                  px: 2,
                  py: 1,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Fade>

          <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                py: 1,
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "0.7rem",
              }}
            >
              Account
            </Typography>
            <List sx={{ px: 2, pt: 1 }}>
              {userItems.map((item, index) => {
                const isCurrentPath = location.pathname + location.search === item.path
                return (
                  <Slide key={item.path} direction="left" in={profileDrawerOpen} timeout={400 + index * 100}>
                    <ListItemButton
                      onClick={() => handleTabClick(item.path)}
                      sx={{
                        px: 2.5,
                        py: 1.75,
                        mb: 1.5,
                        borderRadius: "14px",
                        backgroundColor: isCurrentPath ? "rgba(139, 92, 246, 0.25)" : "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        color: "white",
                        border: isCurrentPath
                          ? "2px solid rgba(139, 92, 246, 0.6)"
                          : "2px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(139, 92, 246, 0.2)",
                          transform: "translateX(-8px) scale(1.02)",
                          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
                          borderColor: "rgba(139, 92, 246, 0.4)",
                          "&::before": {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: "white",
                          minWidth: 44,
                          "& .MuiSvgIcon-root": {
                            fontSize: "1.4rem",
                            filter: isCurrentPath ? "drop-shadow(0 2px 4px rgba(139, 92, 246, 0.5))" : "none",
                          },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{
                          fontWeight: isCurrentPath ? 700 : 500,
                          fontSize: "0.95rem",
                        }}
                      />
                      <ChevronRight
                        sx={{
                          opacity: isCurrentPath ? 1 : 0.5,
                          transition: "all 0.3s ease",
                          fontSize: "1.2rem",
                        }}
                      />
                    </ListItemButton>
                  </Slide>
                )
              })}
            </List>
          </Box>

          <Box
            sx={{
              borderTop: "1px solid rgba(139, 92, 246, 0.2)",
              background: "rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(10px)",
              p: 2,
            }}
          >
            <Slide direction="up" in={profileDrawerOpen} timeout={600}>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  px: 3,
                  py: 2,
                  borderRadius: "14px",
                  backgroundColor: "rgba(239, 68, 68, 0.25)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  border: "2px solid rgba(239, 68, 68, 0.4)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.35)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
                    borderColor: "rgba(239, 68, 68, 0.6)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 44 }}>
                  <LogoutIcon sx={{ fontSize: "1.4rem" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </Slide>
          </Box>
        </Box>
      )}
    </Drawer>
  )

  if (isAuthPage) {
    return null
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-100 px-2 pt-2">
        <div className="max-w-10xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg shadow-gray-900/5 transition-all duration-300 hover:shadow-xl">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                {/* Logo with enhanced animation */}
                <div className="flex-shrink-0">
                  <Link
                    to="/"
                    className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent 
                      hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 
                      hover:scale-105 active:scale-95 relative group"
                  >
                    DylanBiotech
                    {/* Animated underline */}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 
                      group-hover:w-full transition-all duration-500 ease-out"></span>
                  </Link>
                </div>

                {/* Desktop Menu with enhanced animations */}
                <div className="hidden md:flex items-center gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 
                        hover:scale-105 active:scale-95 relative overflow-hidden group ${
                        isActive(item.path)
                          ? "text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50"
                          : "text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-md"
                      }`}
                    >
                      {item.name}
                      {/* Animated background for non-active items */}
                      {!isActive(item.path) && (
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
                      )}
                    </Link>
                  ))}

                  {user ? (
                    <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                      <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden lg:inline px-2
                        animate-pulse">
                        Hi, {user?.name?.split(" ")[0]}
                      </span>

                      {/* Profile burger menu with modern styling */}
                      <button
                        onClick={() => setProfileDrawerOpen(true)}
                        className="p-2.5 rounded-xl text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 
                          transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-md relative group"
                      >
                        <MenuIcon />
                        {/* Ripple effect on hover */}
                        <span className="absolute inset-0 w-full h-full rounded-xl bg-purple-500/10 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 ml-4">
                      <Link
                        to="/login"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 
                          hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 
                          transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md relative group"
                      >
                        Login
                        <span className="absolute inset-0 w-full h-full bg-purple-500/10 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
                      </Link>
                      <Link
                        to="/register"
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white 
                          bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                          hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 
                          transition-all duration-300 shadow-lg shadow-purple-500/40 
                          hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 hover:-translate-y-0.5 
                          active:scale-95 active:translate-y-0 relative group"
                      >
                        Register
                        {/* Animated border */}
                        <span className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                          rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm"></span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile menu with enhanced button */}
                <div className="md:hidden flex items-center gap-2">
                  {user ? (
                    <button
                      onClick={() => setProfileDrawerOpen(true)}
                      className="p-2.5 rounded-xl text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 
                        transition-all duration-300 hover:scale-110 active:scale-95 relative group"
                    >
                      <MenuIcon />
                      <span className="absolute inset-0 w-full h-full bg-purple-500/10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 
                        hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 
                        transition-all duration-300 hover:scale-105 active:scale-95 relative group"
                    >
                      Login
                      <span className="absolute inset-0 w-full h-full bg-purple-500/10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Drawer with modern design */}
      {renderProfileDrawer()}
    </>
  )
}

export default Navigation