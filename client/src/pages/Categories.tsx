"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Box, Container, Typography, Button } from "@mui/material"
import { Add } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import CategoryList from "../components/categories/CategoryList"

const Categories: React.FC = () => {
  const navigate = useNavigate()

  const handleCreateCategory = () => {
    navigate("/categories/create")
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Categories
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                Explore and manage product categories
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateCategory}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Create Category
            </Button>
          </Box>
        </motion.div>

        {/* Categories List */}
        <CategoryList />
      </Container>
    </Box>
  )
}

export default Categories 