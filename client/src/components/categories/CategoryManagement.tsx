"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material"
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Science,
  Warning,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { getCategoriesWithCount, deleteCategory } from "../../api/categoryAPI"
import type { Category } from "../../types/category.d.ts"
import { useAuth } from "../../context/AuthContext" // ✅ Import Auth Context

const CategoryManagement: React.FC = () => {
  const { user } = useAuth() // ✅ Get current user
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    category: Category | null
  }>({ open: false, category: null })

  // ✅ ROLE CHECK — BLOCK NON-ADMINS
  if (user?.role !== "admin") {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Warning sx={{ fontSize: 48, color: "warning.main", mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
      </Box>
    )
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await getCategoriesWithCount()
      setCategories(data)
    } catch (err) {
      setError("Failed to load categories")
      console.error("Error loading categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    navigate("/categories/create")
  }

  const handleEdit = (category: Category) => {
    navigate(`/categories/edit/${category._id}`)
  }

  const handleView = (category: Category) => {
    navigate(`/categories/${category.slug}`)
  }

  const handleDeleteClick = (category: Category) => {
    setDeleteDialog({ open: true, category })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return

    try {
      await deleteCategory(deleteDialog.category._id)
      setCategories(prev => 
        prev.filter(cat => cat._id !== deleteDialog.category!._id)
      )
      setDeleteDialog({ open: false, category: null })
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete category")
      console.error("Error deleting category:", err)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, category: null })
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
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
          Category Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage product categories and their settings
        </Typography>
        
        {/* ✅ Only show if admin (redundant but explicit) */}
        {user?.role === "admin" && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Create New Category
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Categories List */}
      <Box sx={{ display: "grid", gap: 2 }}>
        {categories.map((category, index) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                    <Science sx={{ mr: 2, color: "primary.main", fontSize: 32 }} />
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                        {category.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {category.description}
                      </Typography>
                      
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={`${category.productCount} products`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        
                        {category.featured && (
                          <Chip
                            label="Featured"
                            size="small"
                            color="warning"
                          />
                        )}
                        
                        <Chip
                          label={category.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={category.isActive ? "success" : "error"}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View Category">
                      <IconButton
                        onClick={() => handleView(category)}
                        color="primary"
                        sx={{ bgcolor: "primary.50" }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit Category">
                      <IconButton
                        onClick={() => handleEdit(category)}
                        color="info"
                        sx={{ bgcolor: "info.50" }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Category">
                      <IconButton
                        onClick={() => handleDeleteClick(category)}
                        color="error"
                        sx={{ bgcolor: "error.50" }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Warning color="error" />
          Delete Category
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the category "{deleteDialog.category?.name}"?
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All products in this category will be affected.
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            Category: {deleteDialog.category?.name}
            <br />
            Products: {deleteDialog.category?.productCount}
            <br />
            Slug: {deleteDialog.category?.slug}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Delete Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CategoryManagement