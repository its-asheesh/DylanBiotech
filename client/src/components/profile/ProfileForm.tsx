"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/apiFetch";

// ✅ MUI
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Person, Email, Phone, CloudUpload } from "@mui/icons-material";

// ✅ Zod Schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialData }) => {
  const { setUser } = useAuth();
  const [avatar, setAvatar] = useState(initialData.avatar || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email || "",
      phone: initialData.phone || "",
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "your_cloudinary_preset");
      formData.append("cloud_name", "your_cloudinary_cloud_name");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/your_cloudinary_cloud_name/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setAvatar(data.secure_url);
    } catch (err) {
      console.error("Avatar upload failed", err);
      setAvatar(initialData.avatar || "");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setError("");
    try {
      const payload = { ...data, avatar };
      const res = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.message || "Update failed");
    }
  };

  return (
    <Card elevation={0} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Personal Information
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Update your name, email, phone number, and profile picture.
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Avatar Upload */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(initialData.name)}&background=3f51b5&color=fff`}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Button
            component="label"
            variant="outlined"
            size="small"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Change Photo"}
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {/* Name */}
            <FormControl error={!!errors.name}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
              {errors.name && (
                <FormHelperText>{errors.name.message}</FormHelperText>
              )}
            </FormControl>

            {/* Email */}
            <FormControl error={!!errors.email}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    type="email"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
              {errors.email && (
                <FormHelperText>{errors.email.message}</FormHelperText>
              )}
            </FormControl>

            {/* Phone */}
            <FormControl error={!!errors.phone}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
              {errors.phone && (
                <FormHelperText>{errors.phone.message}</FormHelperText>
              )}
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || uploading}
              sx={{ mt: 1, alignSelf: "flex-start" }}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};