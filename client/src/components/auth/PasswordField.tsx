// src/components/auth/PasswordField.tsx
import type React from "react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";

interface PasswordFieldProps {
  name: string;
  label: string;
  control: any;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  name,
  label,
  control,
  error,
  helperText,
  autoComplete = "current-password",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          error={error}
          helperText={helperText}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            },
          }}
        />
      )}
    />
  );
};