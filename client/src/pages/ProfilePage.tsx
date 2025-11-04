// src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/apiFetch";
import { ProfileTab } from "../components/profile/ProfileTab"; // Will be used for "My Services"
import { OrdersTab } from "../components/profile/OrdersTab";
import { FavoritesTab } from "../components/profile/FavoritesTab";
import { SettingsTab } from "../components/profile/SettingsTab";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Skeleton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
} from "@mui/material";
import Navbar from "../components/layout/Navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import { Layout } from "../components/layout/Layout";

// ✅ Updated tab structure
type TabValue = "services" | "orders" | "favorites" | "settings";

const TABS: { value: TabValue; label: string }[] = [
  { value: "services", label: "My Services" },
  { value: "orders", label: "Order History" },
  { value: "favorites", label: "Favorites" },
  { value: "settings", label: "Settings" },
];

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = (): TabValue => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get("tab");
    if (
      tabParam &&
      ["services", "orders", "favorites", "settings"].includes(tabParam)
    ) {
      return tabParam as TabValue;
    }
    return "services"; // default to "My Services"
  };

  const [activeTab, setActiveTab] = useState<TabValue>(getInitialTab());
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile data
  useEffect(() => {
    if (!user || authLoading) return;
    (async () => {
      setLoading(true);
      try {
        const prof = await apiFetch("/users/profile").then((r) => r.json());
        setProfileData(prof);
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  // Sync URL tab param with activeTab
  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.search, activeTab]);

  // Handle tab change → update URL
  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    navigate(`/profile?tab=${tab}`);
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/");
    }
  };

  if (authLoading || loading || !user) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", gap: 4, pt: "70px" }}>
          <Skeleton variant="rectangular" width={200} height={300} />
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 }, color: "error.main", pt: "70px" }}>
          {error}
        </Box>
      </>
    );
  }

  const safeProfile = {
    name: profileData?.name || user.name || "User",
    email: profileData?.email || user.email || "",
    phone: profileData?.phone || "",
    avatar: profileData?.avatar || "",
  };

const renderContent = () => {
  switch (activeTab) {
    case "services":
      return <Typography>My Services — Coming Soon</Typography>;
    case "orders":
      return <OrdersTab />;
    case "favorites":
      return <FavoritesTab />;
    case "settings":
      return <SettingsTab profileData={safeProfile} />;
    default:
      return <Typography>My Services — Coming Soon</Typography>;
  }
};
  return (
    <>
      <Navbar />
      <Layout surfaceHeight={80}>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            pt: "70px",
            display: "flex",
            gap: { xs: 2, md: 4 },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left Column: Tabs + Logout */}
          <Box sx={{ width: { xs: "100%", md: 240 }, flexShrink: 0 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
            >
              Account
            </Typography>
            <List
              component="nav"
              sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 1 }}
            >
              {TABS.map((tab) => (
                <ListItem key={tab.value} disablePadding>
                  <ListItemButton
                    selected={activeTab === tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": { backgroundColor: "primary.dark" },
                      },
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemText primary={tab.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Logout Button */}
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  py: 1.2,
                  fontWeight: "medium",
                  borderRadius: 1,
                  textTransform: "none",
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>

          {/* Right Column: Content */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </Layout>
    </>
  );
}
