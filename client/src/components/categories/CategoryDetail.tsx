"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  ArrowBack,
  Science,
  Category as CategoryIcon,
  Visibility,
  ShoppingCart,
  Star,
} from "@mui/icons-material"
import { getCategoryBySlug } from "../../api/categoryAPI"
import type { Category } from "../../types/category.d.ts"

const CategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      loadCategory()
    }
  }, [slug])

  const loadCategory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!slug) return
      
      const data = await getCategoryBySlug(slug)
      if (data) {
        setCategory(data)
      } else {
        setError("Category not found")
      }
    } catch (err) {
      setError("Failed to load category. Please try again later.")
      console.error("Error loading category:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackClick = () => {
    navigate("/categories")
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error || !category) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || "Category not found"}
          <Button
            onClick={handleBackClick}
            sx={{ ml: 2 }}
            variant="outlined"
            size="small"
          >
            Back to Categories
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Back to Categories
        </Button>
      </Box>

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ position: "relative" }}>
            {category.image && (
              <CardMedia
                component="img"
                height="300"
                image={`http://localhost:5000/${category.image}`}
                alt={category.name}
                sx={{
                  objectFit: "cover",
                  opacity: 0.3,
                }}
              />
            )}
            
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                p: 4,
              }}
            >
              <CardContent sx={{ color: "white", p: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Science sx={{ mr: 2, fontSize: 40 }} />
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: "bold",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>
                
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    opacity: 0.9,
                    maxWidth: 600,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {category.description}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip
                    icon={<CategoryIcon />}
                    label={`${category.productCount} Products`}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  
                  {category.featured && (
                    <Chip
                      icon={<Star />}
                      label="Featured"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                  )}
                  
                  <Chip
                    label={category.isActive ? "Active" : "Inactive"}
                    color={category.isActive ? "success" : "error"}
                    sx={{
                      bgcolor: category.isActive 
                        ? "rgba(76, 175, 80, 0.2)" 
                        : "rgba(244, 67, 54, 0.2)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </Box>
              </CardContent>
            </Box>
          </Box>
        </Card>
      </motion.div>

      {/* Category Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", p: 3, borderRadius: 3 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: "bold" }}>
                {category.productCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", p: 3, borderRadius: 3 }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: "bold" }}>
                {category.isActive ? "Active" : "Inactive"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", p: 3, borderRadius: 3 }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: "bold" }}>
                {category.featured ? "Yes" : "No"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Featured
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", p: 3, borderRadius: 3 }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: "bold" }}>
                {new Date(category.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Category Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: "bold" }}>
              Category Details
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {category.name}
                </Typography>
                
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Slug
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {category.slug}
                </Typography>
                
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={category.isActive ? "Active" : "Inactive"}
                  color={category.isActive ? "success" : "error"}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Featured
                </Typography>
                <Chip
                  label={category.featured ? "Featured" : "Not Featured"}
                  color={category.featured ? "warning" : "default"}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(category.createdAt).toLocaleString()}
                </Typography>
                
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(category.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {category.description}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Visibility />}
            onClick={() => navigate(`/products?category=${category.slug}`)}
            sx={{ borderRadius: 2, px: 4 }}
          >
            View Products
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={() => navigate("/categories")}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Browse All Categories
          </Button>
        </Box>
      </motion.div>
    </Container>
  )
}

export default CategoryDetail 