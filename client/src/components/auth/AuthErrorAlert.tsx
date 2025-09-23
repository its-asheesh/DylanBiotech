// src/components/auth/AuthErrorAlert.tsx
import { Alert } from "@mui/material";
import { motion } from "framer-motion";

export const AuthErrorAlert: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
        {message}
      </Alert>
    </motion.div>
  );
};
