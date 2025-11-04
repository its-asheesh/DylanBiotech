"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/utils/apiFetch";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// ✅ Reusable PasswordField
import { PasswordField } from "@/components/auth/PasswordField";

// ✅ MUI Components
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Typography,
} from "@mui/material";

// ✅ MUI Icons
import {
  DarkMode,
  Delete,
  Edit,
  LocationOn,
  Lock,
  Notifications,
  PrivacyTip,
  Translate,
} from "@mui/icons-material";

// ✅ Zod Schema for password change
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface SettingsTabProps {
  profileData: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ profileData }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // ✅ Delete account dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [deletePassword, setDeletePassword] = useState<string>("");
  const [deletePasswordError, setDeletePasswordError] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // ✅ Change Password
  const onSubmitPassword = async (data: PasswordFormData) => {
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      const res = await apiFetch("/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to change password");
      }

      reset();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Password change failed");
    }
  };

  // ✅ Open delete dialog
  const handleDeleteAccount = () => {
    setDeletePassword("");
    setDeletePasswordError("");
    setOpenDeleteDialog(true);
  };

  // ✅ Confirm delete with password
  const handleConfirmDelete = async () => {
    if (!deletePassword.trim()) {
      setDeletePasswordError("Password is required");
      return;
    }

    setDeleting(true);
    try {
      const res = await apiFetch("/users/delete-account", {
        method: "DELETE",
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete account");
      }

      logout?.();
      navigate("/login", { replace: true });
    } catch (err: any) {
      setDeletePasswordError(
        err.message || "Account deletion failed. Please check your password."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {/* 🔒 Security Card */}
        <Grid size={{xs:12, md:6}}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Security
              </Typography>

              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}

              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Password updated successfully!
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <PasswordField
                  name="currentPassword"
                  label="Current Password"
                  control={control}
                  error={!!passwordError}
                  helperText={passwordError || " "}
                  autoComplete="current-password"
                />

                <PasswordField
                  name="newPassword"
                  label="New Password"
                  control={control}
                  autoComplete="new-password"
                />

                <PasswordField
                  name="confirmNewPassword"
                  label="Confirm New Password"
                  control={control}
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={<Lock />}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  {isSubmitting ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* ⚙️ Preferences Card */}
        <Grid size={{xs:12, md:6}}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Preferences
              </Typography>
              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <DarkMode />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary="Dark mode" />
                    <Switch edge="end" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: "success.main" }}>
                        <Notifications />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Push notifications"
                      secondary="Allow app to send promotional alerts"
                    />
                    <Switch edge="end" defaultChecked />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: "warning.main" }}>
                        <Translate />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary="Language" secondary="English" />
                    <Edit color="action" />
                  </ListItemButton>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 📝 Account Card */}
        <Grid size={{xs:12, md:6}}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account
              </Typography>
              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <LocationOn />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Address book"
                      secondary="Manage shipping addresses"
                    />
                    <Edit color="action" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: "error.main" }}>
                        <PrivacyTip />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary="Privacy policy" />
                  </ListItemButton>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* ☠️ Danger Zone */}
        <Grid size={{xs:12, md:6}}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="error"
                gutterBottom
              >
                Danger zone
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                fullWidth
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete account"}
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, display: "block" }}
              >
                Deleted accounts cannot be recovered.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ✅ Delete Account Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-account-dialog"
      >
        <DialogTitle color="error" id="delete-account-dialog">
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            This action is irreversible. Please enter your password to confirm.
          </Typography>
          <PasswordField
            label="Password"
            value={deletePassword}
            onChange={(value) => setDeletePassword(value)}
            error={!!deletePasswordError}
            helperText={deletePasswordError || " "}
            autoComplete="current-password"
            sx={{ mb: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};