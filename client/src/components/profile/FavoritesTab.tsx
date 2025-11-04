// src/components/profile/FavoritesTab.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/apiFetch";
import { Box, Typography, Grid, Card, CardMedia, CardContent, CircularProgress } from "@mui/material";
import { Favorite } from "@mui/icons-material";
import { EmptyState } from "./EmptyState";

export const FavoritesTab = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiFetch("/favorites");
        const data = await res.json();
        setFavorites(data.products || []);
      } catch (err) {
        console.error("Failed to fetch favorites", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
      icon={<Favorite sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}/>}
      title="No favorites yet"
      description="Add products to your favorites to see them here."
      />
    );
  }

  return (
    <Grid container spacing={3}>
      {favorites.map((product) => (
        <Grid size={{xs:12,sm:6,md:4}} key={product._id}>
          <Card>
            <CardMedia
              component="img"
              height="140"
              image={product.image || "/placeholder.jpg"}
              alt={product.name}
            />
            <CardContent>
              <Typography variant="subtitle1">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                ${product.price?.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};