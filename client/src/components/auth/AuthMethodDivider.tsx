// src/components/auth/AuthMethodDivider.tsx
import { Box, Divider } from "@mui/material";

interface AuthMethodDividerProps {
  text?: string;
}

export const AuthMethodDivider: React.FC<AuthMethodDividerProps> = ({
  text = "Or continue with",
}) => (
  <Box sx={{ my: 3 }}>
    <Divider>{text}</Divider>
  </Box>
);