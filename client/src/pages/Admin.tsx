"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material"
import {
  Category,
  Inventory,
  People,
  Settings,
} from "@mui/icons-material"
import CategoryManagement from "../components/categories/CategoryManagement"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const Admin: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
              mb: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your application settings and content
          </Typography>
        </Box>
      </motion.div>

      {/* Admin Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin tabs"
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
                fontSize: "1rem",
                fontWeight: 500,
              },
            }}
          >
            <Tab
              icon={<Category />}
              label="Categories"
              iconPosition="start"
            />
            <Tab
              icon={<Inventory />}
              label="Products"
              iconPosition="start"
            />
            <Tab
              icon={<People />}
              label="Users"
              iconPosition="start"
            />
            <Tab
              icon={<Settings />}
              label="Settings"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <CategoryManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Product Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Product management features coming soon...
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              User management features coming soon...
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Application Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Application settings coming soon...
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  )
}

export default Admin 