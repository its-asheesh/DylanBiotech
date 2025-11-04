// src/components/auth/PasswordField.tsx

import type React from "react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import type { SxProps, Theme } from '@mui/material/styles';

interface BaseProps {
  label: string;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
  sx?: SxProps<Theme>;
}

interface HookFormProps extends BaseProps {
  name: string;
  control: any;
}

interface ControlledProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
}

type PasswordFieldProps = HookFormProps | ControlledProps;

export const PasswordField: React.FC<PasswordFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const combinedSx = {
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
    },
    ...props.sx,
  };

  // ✅ Discriminate based on presence of 'control'
  if ('control' in props) {
    // TypeScript now knows: props is HookFormProps → name is string
    return (
      <Controller
        name={props.name}
        control={props.control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={props.label}
            type={showPassword ? "text" : "password"}
            autoComplete={props.autoComplete ?? "current-password"}
            error={props.error}
            helperText={props.helperText}
            sx={combinedSx}
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
          />
        )}
      />
    );
  } else {
    // Controlled mode
    return (
      <TextField
        fullWidth
        label={props.label}
        type={showPassword ? "text" : "password"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete ?? "current-password"}
        error={props.error}
        helperText={props.helperText}
        sx={combinedSx}
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
      />
    );
  }
};