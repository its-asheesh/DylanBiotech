"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material"
import { Search, FilterList, Clear } from "@mui/icons-material"
import CategoryCard from "./CategoryCard"
import { getCategories, getCategoriesWithCount, searchCategories } from "../../api/categoryAPI"
import type { Category } from "../../types/category.d.ts"

interface CategoryListProps {
  showFeaturedOnly?: boolean
  title?: string
  subtitle?: string
}

const CategoryList: React.FC<CategoryListProps> = ({
  showFeaturedOnly = false,
  title = "All Categories",
  subtitle = "Explore our comprehensive collection of product categories",
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterActive, setFilterActive] = useState("all")

  useEffect(() => {
    loadCategories()
  }, [showFeaturedOnly])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let data: Category[]
      if (showFeaturedOnly) {
        data = await getCategoriesWithCount()
        data = data.filter(cat => cat.featured)
      } else {
        data = await getCategoriesWithCount()
      }
      
      setCategories(data)
      setFilteredCategories(data)
    } catch (err) {
      setError("Failed to load categories. Please try again later.")
      console.error("Error loading categories:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    filterAndSortCategories()
  }, [categories, searchQuery, sortBy, filterActive])

  const filterAndSortCategories = () => {
    let filtered = [...categories]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply active/inactive filter
    if (filterActive === "active") {
      filtered = filtered.filter(category => category.isActive)
    } else if (filterActive === "inactive") {
      filtered = filtered.filter(category => !category.isActive)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "products":
          return b.productCount - a.productCount
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    setFilteredCategories(filtered)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (query.trim() && query.length > 2) {
      try {
        const searchResults = await searchCategories(query)
        setFilteredCategories(searchResults)
      } catch (err) {
        console.error("Search error:", err)
        // Fall back to local filtering
        filterAndSortCategories()
      }
    } else {
      filterAndSortCategories()
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSortBy("name")
    setFilterActive("all")
  }

  const hasActiveFilters = searchQuery || sortBy !== "name" || filterActive !== "all"

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

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
          <Button
            onClick={loadCategories}
            sx={{ ml: 2 }}
            variant="outlined"
            size="small"
          >
            Retry
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
            {title}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
          >
            {subtitle}
          </Typography>
        </motion.div>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => setSearchQuery("")}
                      sx={{ minWidth: "auto" }}
                    >
                      <Clear />
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="products">Most Products</MenuItem>
                <MenuItem value="featured">Featured First</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterActive}
                label="Status"
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            {hasActiveFilters && (
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                startIcon={<FilterList />}
              >
                Clear
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Results Summary */}
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={`${filteredCategories.length} categories`}
            color="primary"
            variant="outlined"
          />
          {hasActiveFilters && (
            <Chip
              label="Filters applied"
              color="secondary"
              variant="outlined"
              onDelete={clearFilters}
            />
          )}
        </Box>
      </Box>

      {/* Categories Grid */}
      <AnimatePresence mode="wait">
        {filteredCategories.length > 0 ? (
          <Grid container spacing={3}>
            {filteredCategories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
                <CategoryCard category={category} index={index} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "text.secondary",
              }}
            >
              <Typography variant="h6" gutterBottom>
                No categories found
              </Typography>
              <Typography variant="body2">
                {searchQuery
                  ? `No categories match "${searchQuery}". Try adjusting your search.`
                  : "No categories are available at the moment."}
              </Typography>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  sx={{ mt: 2 }}
                  variant="outlined"
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}

export default CategoryList 