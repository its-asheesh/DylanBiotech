"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Save,
  Cancel,
  CloudUpload,
  Delete,
  ArrowBack,
} from "@mui/icons-material"
import { createCategory, updateCategory, getCategoryById } from "../../api/categoryAPI"
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../../types/category.d.ts"

interface CategoryFormProps {
  mode: "create" | "edit"
}

const CategoryForm: React.FC<CategoryFormProps> = ({ mode }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: "",
    description: "",
    image: "",
    featured: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode === "edit" && id) {
      loadCategory()
    }
  }, [mode, id])

  const loadCategory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const category = await getCategoryById(id!)
      if (category) {
        setFormData({
          name: category.name,
          description: category.description,
          image: category.image || "",
          featured: category.featured,
        })
      } else {
        setError("Category not found")
      }
    } catch (err) {
      setError("Failed to load category")
      console.error("Error loading category:", err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CreateCategoryInput, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you'd upload to a file service
      // For now, we'll just store the filename
      setFormData(prev => ({
        ...prev,
        image: file.name,
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (mode === "create") {
        await createCategory(formData)
        setSuccess("Category created successfully!")
      } else if (mode === "edit" && id) {
        const updateData: UpdateCategoryInput = {
          name: formData.name,
          description: formData.description,
          image: formData.image,
          featured: formData.featured,
        }
        await updateCategory(id, updateData)
        setSuccess("Category updated successfully!")
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/categories")
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category")
      console.error("Error saving category:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
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

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleCancel}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back to Categories
        </Button>
        
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {mode === "create" ? "Create New Category" : "Edit Category"}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {mode === "create" 
            ? "Add a new category to organize your products"
            : "Update category information and settings"
          }
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Basic Information
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="Enter category name"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Enter category description"
                  multiline
                  rows={4}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Image Upload */}
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Category Image
              </Typography>

              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                  </Button>
                </label>

                {formData.image && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Selected: {formData.image}
                    </Typography>
                    <Tooltip title="Remove image">
                      <IconButton
                        size="small"
                        onClick={() => handleInputChange("image", "")}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Settings */}
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Settings
              </Typography>

              <Box sx={{ mb: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.featured}
                      onChange={(e) => handleInputChange("featured", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Featured Category"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Featured categories will be highlighted and appear first in listings
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<Cancel />}
                  disabled={saving}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  disabled={saving}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  {saving ? "Saving..." : mode === "create" ? "Create Category" : "Update Category"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  )
}

export default CategoryForm 