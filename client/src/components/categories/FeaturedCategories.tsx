"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Box,
  Typography,
  Button,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material"
import { ArrowForward } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import CategoryList from "./CategoryList"
import { getFeaturedCategories } from "../../api/categoryAPI"
import type { Category } from "../../types/category.d.ts"

const FeaturedCategories: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeaturedCategories()
  }, [])

  const loadFeaturedCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await getFeaturedCategories()
      setCategories(data)
    } catch (err) {
      setError("Failed to load featured categories")
      console.error("Error loading featured categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewAll = () => {
    navigate("/categories")
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (categories.length === 0) {
    return null // Don't show anything if no featured categories
  }

  return (
    <Box sx={{ py: 6, bgcolor: "grey.50" }}>
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: "bold",
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Featured Categories
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Discover our most popular product categories
            </Typography>
            
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={handleViewAll}
              sx={{ borderRadius: 2, px: 4 }}
            >
              View All Categories
            </Button>
          </Box>
        </motion.div>

        {/* Featured Categories Grid */}
        <CategoryList
          showFeaturedOnly={true}
          title=""
          subtitle=""
        />
      </Container>
    </Box>
  )
}

export default FeaturedCategories 