// src/components/auth/GoogleButton.tsx
import { Button,CircularProgress } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import type React from "react";

interface GoogleButtonProps {
  onClick: () => void;
  isPending: boolean;
  label: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onClick,
  isPending,
  label,
}) => {
  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={onClick}
      disabled={isPending}
      sx={{
        py: 1.5,
        mb: 2,
        borderRadius: 2,
        borderColor: "#DB4437",
        color: "#DB4437",
        fontWeight: "bold",
        "&:hover": {
          borderColor: "#C0392B",
          backgroundColor: "rgba(219, 68, 55, 0.04)",
        },
      }}
    >
      {isPending ? "Redirecting to Google..." : label}
      {isPending && <CircularProgress size={16} sx={{ ml: 1 }} />}
    </Button>
  );
};
