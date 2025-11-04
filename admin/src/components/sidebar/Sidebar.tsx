// src/components/Sidebar.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Person,
  ShoppingCart,
  Favorite,
  Settings,
  AdminPanelSettings,
  Logout as LogoutIcon,
  ChevronRight,
  Close as CloseIcon,
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
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material"

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

export interface SidebarProps {
  user?: User | null
  onLogout?: () => void
  open?: boolean
  onClose?: () => void
  variant?: "permanent" | "persistent" | "temporary"
}

const Sidebar: React.FC<SidebarProps> = ({
  user = null,
  onLogout,
  open = true,
  onClose,
  variant = "permanent",
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Check if current route matches (including query params for tabs)
  const isActive = (path: string) => {
    const [pathname, search] = path.split("?")
    return location.pathname === pathname && (!search || location.search.includes(search))
  }

  // Navigation items (public + admin)
  const navItems = [
    { name: "Products", path: "/" },
    ...(user?.role === "admin" ? [{ name: "Categories", path: "/categories" }] : []),
  ]

  // User-specific menu items
  const userItems = user
    ? [
        { name: "Profile", path: "/profile?tab=profile", icon: <Person /> },
        { name: "My Orders", path: "/profile?tab=orders", icon: <ShoppingCart /> },
        { name: "Favorites", path: "/profile?tab=favorites", icon: <Favorite /> },
        { name: "Settings", path: "/profile?tab=settings", icon: <Settings /> },
        ...(user.role === "admin" ? [{ name: "Admin Panel", path: "/admin", icon: <AdminPanelSettings /> }] : []),
      ]
    : []

  const handleTabClick = (path: string) => {
    navigate(path)
    if (isMobile && onClose) onClose()
  }

  const handleLogout = () => {
    if (onClose) onClose()
    if (onLogout) {
      if (window.confirm("Are you sure you want to log out?")) {
        onLogout()
        navigate("/")
      }
    }
  }

  return (
    <Drawer
      variant={variant}
      open={variant !== "temporary" || open}
      onClose={onClose}
      anchor="left"
      PaperProps={{
        sx: {
          width: { xs: "85%", sm: "280px" },
          maxWidth: "320px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "10px 0 40px rgba(0, 0, 0, 0.3)",
        },
      }}
      transitionDuration={400}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Close button (mobile only) */}
        {variant === "temporary" && (
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(139, 92, 246, 0.35)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        {/* User Header */}
        {user && (
          <Fade in timeout={600}>
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
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=ffffff&bold=true`}
                  sx={{
                    width: 80,
                    height: 80,
                    border: "3px solid rgba(139, 92, 246, 0.5)",
                    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "white", mb: 0.5 }}>
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
        )}

        {/* Navigation */}
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
            Navigation
          </Typography>
          <List sx={{ px: 2, pt: 1 }}>
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={() => isMobile && onClose?.()}
                  sx={{
                    px: 2.5,
                    py: 1.75,
                    mb: 1.5,
                    borderRadius: "14px",
                    backgroundColor: active ? "rgba(139, 92, 246, 0.25)" : "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    border: active ? "2px solid rgba(139, 92, 246, 0.6)" : "2px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      backgroundColor: "rgba(139, 92, 246, 0.2)",
                      transform: "translateX(4px)",
                      boxShadow: "0 6px 20px rgba(139, 92, 246, 0.3)",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                  />
                  <ChevronRight sx={{ opacity: 0.6 }} />
                </ListItemButton>
              )
            })}
          </List>

          {user && (
            <>
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
              <List sx={{ px: 2 }}>
                {userItems.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <ListItemButton
                      key={item.path}
                      onClick={() => handleTabClick(item.path)}
                      sx={{
                        px: 2.5,
                        py: 1.75,
                        mb: 1.5,
                        borderRadius: "14px",
                        backgroundColor: active ? "rgba(139, 92, 246, 0.25)" : "rgba(255, 255, 255, 0.05)",
                        color: "white",
                        border: active ? "2px solid rgba(139, 92, 246, 0.6)" : "2px solid rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        "&:hover": {
                          backgroundColor: "rgba(139, 92, 246, 0.2)",
                          transform: "translateX(4px)",
                          boxShadow: "0 6px 20px rgba(139, 92, 246, 0.3)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                      />
                      <ChevronRight sx={{ opacity: 0.6 }} />
                    </ListItemButton>
                  )
                })}
              </List>
            </>
          )}
        </Box>

        {/* Logout Button */}
        {user && onLogout && (
          <Box
            sx={{
              borderTop: "1px solid rgba(139, 92, 246, 0.2)",
              background: "rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(10px)",
              p: 2,
            }}
          >
            <ListItemButton
              onClick={handleLogout}
              sx={{
                px: 3,
                py: 2,
                borderRadius: "14px",
                backgroundColor: "rgba(239, 68, 68, 0.25)",
                color: "white",
                border: "2px solid rgba(239, 68, 68, 0.4)",
                "&:hover": {
                  backgroundColor: "rgba(239, 68, 68, 0.35)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 700 }} />
            </ListItemButton>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default Sidebar