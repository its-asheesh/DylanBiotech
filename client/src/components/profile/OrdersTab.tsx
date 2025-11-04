import React from "react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/apiFetch";
import { Box, List, ListItem, ListItemText, Divider, CircularProgress, Typography } from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { EmptyState } from "./EmptyState";

export const OrdersTab = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiFetch("/orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />}
        title="No orders yet"
        description="Your orders will appear here once you make a purchase."
      />
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {orders.map((order) => (
        <React.Fragment key={order._id}>
          <ListItem sx={{ py: 2 }}>
            <ListItemText
              primary={`Order #${order._id.slice(-6)}`}
              secondary={`Placed on ${new Date(order.createdAt).toLocaleDateString()}`}
            />
            <Typography variant="body2" fontWeight="bold">
              ${order.totalPrice?.toFixed(2)}
            </Typography>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};