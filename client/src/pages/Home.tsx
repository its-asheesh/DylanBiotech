"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  Fab,
  Skeleton,
  IconButton,
} from "@mui/material"
import { Search, ShoppingCart, Favorite, FavoriteBorder, FilterList, KeyboardArrowUp } from "@mui/icons-material"
import { getProducts } from "../api/productAPI"
import type { Product } from "../types/product.d.ts"
import FeaturedCategories from "../components/categories/FeaturedCategories"

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setError(null)
        const data = await getProducts()
        setProducts(Array.isArray(data) ? data : [])
        setFilteredProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error loading products:", error)
        setError("Failed to load products")
        setProducts([])
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const ProductCardSkeleton = () => (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" height={24} width="60%" />
        <Skeleton variant="text" height={28} width="40%" />
      </CardContent>
      <CardActions>
        <Skeleton variant="rectangular" width={80} height={36} />
        <Skeleton variant="circular" width={40} height={40} />
      </CardActions>
    </Card>
  )

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url(/placeholder.svg?height=400&width=800)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: "bold",
                mb: 2,
                textAlign: "center",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              Company name{/* DylanBiotech */}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                textAlign: "center",
                opacity: 0.9,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Discover Premium Biotechnology Products
            </Typography>

            {/* Search Bar */}
            <Box sx={{ maxWidth: 600, mx: "auto" }}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "white" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 3,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                      "&::placeholder": {
                        color: "rgba(255, 255, 255, 0.7)",
                        opacity: 1,
                      },
                    },
                  },
                }}
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Products Section */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
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
                Our Products
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Explore our comprehensive collection of biotechnology products
              </Typography>
            </Box>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants}>
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <Grid container spacing={3}>
                {[...Array(8)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <ProductCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : filteredProducts.length > 0 ? (
              <Grid container spacing={3}>
                {filteredProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      layout
                    >
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 3,
                          overflow: "hidden",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={product.image || "https://via.placeholder.com/400x200?text=Product"}
                          alt={product.name}
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                            <Typography
                              variant="h6"
                              component="h3"
                              sx={{
                                fontWeight: "bold",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flexGrow: 1,
                              }}
                            >
                              {product.name}
                            </Typography>
                            <IconButton
                              onClick={() => toggleFavorite(product._id)}
                              sx={{ ml: 1, color: favorites.has(product._id) ? "error.main" : "grey.400" }}
                            >
                              {favorites.has(product._id) ? <Favorite /> : <FavoriteBorder />}
                            </IconButton>
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {product.brand}
                          </Typography>

                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                            <Chip
                              label={product.category}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            />
                            <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                              ${product.price}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              mb: 2,
                            }}
                          >
                            {product.description}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<ShoppingCart />}
                            sx={{ borderRadius: 2 }}
                          >
                            Add to Cart
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
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
                    No products found
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm
                      ? `No products match "${searchTerm}". Try adjusting your search.`
                      : "No products are available at the moment."}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>

      {/* Featured Categories Section */}
      <FeaturedCategories />

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <Fab
              color="primary"
              onClick={scrollToTop}
              sx={{
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default Home
