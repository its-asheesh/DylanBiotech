"use client"

import type React from "react"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material"
import { Science, Category as CategoryIcon, Visibility } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import type { Category } from "../../types/category.d.ts"

interface CategoryCardProps {
  category: Category
  index?: number
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index = 0 }) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/categories/${category.slug}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      layout
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          },
        }}
        onClick={handleCardClick}
      >
        <Box sx={{ position: "relative" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <CardMedia
              component="img"
              height="200"
              image={
                category.image
                  ? `http://localhost:5000/${category.image}`
                  : "https://via.placeholder.com/400x200?text=Category"
              }
              alt={category.name}
              sx={{
                objectFit: "cover",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            />
          </motion.div>

          {/* Featured Badge */}
          {category.featured && (
            <Chip
              label="Featured"
              color="primary"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                fontWeight: "bold",
              }}
            />
          )}

          {/* Product Count */}
          <Chip
            label={`${category.productCount} products`}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: "rgba(0,0,0,0.7)",
              color: "white",
              backdropFilter: "blur(10px)",
            }}
          />

          {/* View Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
            }}
          >
            <Tooltip title="View Category">
              <IconButton
                sx={{
                  bgcolor: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,1)",
                  },
                }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
          </motion.div>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Science
              sx={{
                mr: 1,
                color: "primary.main",
                fontSize: 24,
              }}
            />
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
              {category.name}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {category.description}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Chip
              icon={<CategoryIcon />}
              label="Category"
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            
            {!category.isActive && (
              <Chip
                label="Inactive"
                size="small"
                color="error"
                sx={{ borderRadius: 2 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CategoryCard
