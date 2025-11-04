// // src/components/profile/ProfileLayout.tsx
// "use client";

// import { useState } from "react";
// import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Typography, useTheme } from "@mui/material";
// import { Person, ShoppingCart, Favorite, Settings, DarkMode, LightMode, Logout } from "@mui/icons-material";
// import { useAuth } from "@/context/AuthContext";
// import { useNavigate } from "react-router-dom";

// interface ProfileLayoutProps {
//   children: React.ReactNode;
// }

// export default function ProfileLayout({ children }: ProfileLayoutProps) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const [darkMode, setDarkMode] = useState(() => {
//     return localStorage.getItem("darkMode") === "true";
//   });

//   const toggleDark = () => {
//     const next = !darkMode;
//     setDarkMode(next);
//     localStorage.setItem("darkMode", String(next));
//     // Optional: trigger global theme change if you have one
//   };

//   const navItems = [
//     { key: "profile", label: "Profile", icon: <Person /> },
//     { key: "orders", label: "My Orders", icon: <ShoppingCart /> },
//     { key: "favorites", label: "Favorites", icon: <Favorite /> },
//     { key: "settings", label: "Settings", icon: <Settings /> },
//   ];

//   return (
//     <Box sx={{ display: "flex", minHeight: "100vh", background: theme.palette.background.default }}>
//       {/* Sidebar */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           width: 240,
//           flexShrink: 0,
//           [`& .MuiDrawer-paper`]: {
//             width: 240,
//             boxSizing: "border-box",
//             borderRight: `1px solid ${theme.palette.divider}`,
//             background: theme.palette.background.paper,
//           },
//         }}
//       >
//         <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
//           <Typography variant="h6" fontWeight="bold">My Account</Typography>
//         </Box>

//         <List>
//           {navItems.map((item) => (
//             <ListItemButton
//               key={item.key}
//               onClick={() => navigate(`/profile#${item.key}`)}
//               sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
//             >
//               <ListItemIcon>{item.icon}</ListItemIcon>
//               <ListItemText primary={item.label} />
//             </ListItemButton>
//           ))}

//           <Divider sx={{ my: 1 }} />

//           <ListItemButton onClick={toggleDark}>
//             <ListItemIcon>{darkMode ? <LightMode /> : <DarkMode />}</ListItemIcon>
//             <ListItemText primary="Dark mode" />
//             <IconButton size="small">
//               <div className={`w-12 h-6 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
//                 <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
//               </div>
//             </IconButton>
//           </ListItemButton>

//           <ListItemButton onClick={logout} sx={{ color: "error.main" }}>
//             <ListItemIcon><Logout /></ListItemIcon>
//             <ListItemText primary="Logout" />
//           </ListItemButton>
//         </List>
//       </Drawer>

//       {/* Main Content */}
//       <Box component="main" sx={{ flexGrow: 1, p: 3, background: theme.palette.background.default }}>
//         {children}
//       </Box>
//     </Box>
//   );
// }