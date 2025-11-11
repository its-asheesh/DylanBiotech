// src/pages/AdminManagement.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Grid,
  Pagination,
} from '@mui/material';
import {
  Edit,
  Visibility,
  AdminPanelSettings,
  Search,
  FilterList,
  Add,
} from '@mui/icons-material';
import {
  listAdmins,
  getAdminById,
  updateAdminPermissions,
  grantPermission,
  revokePermission,
  type Admin,
  type AdminLevel,
  type Permission,
} from '../services/adminApi';
import { useAuth } from '../context/AuthContext';

const ADMIN_LEVEL_LABELS: Record<AdminLevel, string> = {
  1: 'Moderator',
  2: 'Admin',
  3: 'Super Admin',
};

const PERMISSION_GROUPS: Record<string, Permission[]> = {
  'User Management': [
    'view_users',
    'manage_users',
    'delete_users',
    'manage_user_roles',
  ],
  'Product Management': [
    'view_products',
    'create_products',
    'update_products',
    'delete_products',
  ],
  'Category Management': [
    'view_categories',
    'manage_categories',
  ],
  'Tag Category Management': [
    'view_tag_categories',
    'manage_tag_categories',
  ],
  'Analytics & Dashboard': [
    'view_analytics',
    'view_dashboard',
  ],
  'Settings': [
    'manage_settings',
  ],
};

export default function AdminManagement() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [adminLevelFilter, setAdminLevelFilter] = useState<AdminLevel | ''>('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [newAdminLevel, setNewAdminLevel] = useState<AdminLevel>(2);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [saving, setSaving] = useState(false);

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.adminLevel === 3;

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdmins();
    } else {
      setError('Access denied. Super admin privileges required.');
      setLoading(false);
    }
  }, [page, search, adminLevelFilter, isSuperAdmin]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listAdmins({
        page,
        limit: 10,
        adminLevel: adminLevelFilter || undefined,
        search: search || undefined,
      });
      setAdmins(response.admins);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAdmin = async (adminId: string) => {
    try {
      const response = await getAdminById(adminId);
      setSelectedAdmin(response.admin);
      setViewDialogOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin details');
    }
  };

  const handleEditAdmin = async (admin: Admin) => {
    setEditingAdmin(admin);
    setNewAdminLevel(admin.adminLevel || 2);
    setSelectedPermissions(admin.permissions || []);
    setEditDialogOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!editingAdmin) return;

    try {
      setSaving(true);
      setError(null);

      await updateAdminPermissions(editingAdmin._id, {
        adminLevel: newAdminLevel,
        permissions: selectedPermissions,
      });

      setEditDialogOpen(false);
      setEditingAdmin(null);
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to update admin permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePermission = (permission: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSelectAllInGroup = (groupPermissions: Permission[]) => {
    const allSelected = groupPermissions.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermissions.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => {
        const newPerms = [...prev];
        groupPermissions.forEach((p) => {
          if (!newPerms.includes(p)) {
            newPerms.push(p);
          }
        });
        return newPerms;
      });
    }
  };

  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">Access denied. Super admin privileges required.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Admin Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            // Navigate to users page to promote a user
            window.location.href = '/admin/users';
          }}
        >
          Promote User to Admin
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Admin Level</InputLabel>
              <Select
                value={adminLevelFilter}
                label="Admin Level"
                onChange={(e) => setAdminLevelFilter(e.target.value as AdminLevel | '')}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value={1}>Moderator</MenuItem>
                <MenuItem value={2}>Admin</MenuItem>
                <MenuItem value={3}>Super Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Admin Level</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary" sx={{ py: 2 }}>
                            No admins found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow key={admin._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AdminPanelSettings color="primary" />
                              <Typography fontWeight="medium">{admin.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{admin.email || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={ADMIN_LEVEL_LABELS[admin.adminLevel || 2]}
                              color={
                                admin.adminLevel === 3
                                  ? 'error'
                                  : admin.adminLevel === 2
                                  ? 'primary'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {admin.permissions?.length || 0} permissions
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewAdmin(admin._id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Permissions">
                              <IconButton
                                size="small"
                                onClick={() => handleEditAdmin(admin)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Admin Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Admin Details</DialogTitle>
        <DialogContent>
          {selectedAdmin && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{selectedAdmin.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedAdmin.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Admin Level
                  </Typography>
                  <Chip
                    label={ADMIN_LEVEL_LABELS[selectedAdmin.adminLevel || 2]}
                    color={
                      selectedAdmin.adminLevel === 3
                        ? 'error'
                        : selectedAdmin.adminLevel === 2
                        ? 'primary'
                        : 'default'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedAdmin.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Permissions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedAdmin.permissions && selectedAdmin.permissions.length > 0 ? (
                      selectedAdmin.permissions.map((perm) => (
                        <Chip key={perm} label={perm.replace(/_/g, ' ')} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No custom permissions (using default for level)
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedAdmin && (
            <Button
              variant="contained"
              onClick={() => {
                setViewDialogOpen(false);
                handleEditAdmin(selectedAdmin);
              }}
            >
              Edit Permissions
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Admin Permissions</DialogTitle>
        <DialogContent>
          {editingAdmin && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {editingAdmin.name}
              </Typography>

              <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
                <InputLabel>Admin Level</InputLabel>
                <Select
                  value={newAdminLevel}
                  label="Admin Level"
                  onChange={(e) => setNewAdminLevel(e.target.value as AdminLevel)}
                  disabled={editingAdmin.adminLevel === 3}
                >
                  <MenuItem value={1}>Moderator</MenuItem>
                  <MenuItem value={2}>Admin</MenuItem>
                  <MenuItem value={3} disabled={editingAdmin.adminLevel !== 3}>
                    Super Admin
                  </MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Permissions
              </Typography>

              {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPermissions]) => (
                <Box key={groupName} sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={groupPermissions.every((p) =>
                          selectedPermissions.includes(p)
                        )}
                        indeterminate={
                          groupPermissions.some((p) => selectedPermissions.includes(p)) &&
                          !groupPermissions.every((p) => selectedPermissions.includes(p))
                        }
                        onChange={() => handleSelectAllInGroup(groupPermissions)}
                      />
                    }
                    label={
                      <Typography variant="subtitle2" fontWeight="bold">
                        {groupName}
                      </Typography>
                    }
                  />
                  <Box sx={{ ml: 4, mt: 1 }}>
                    {groupPermissions.map((permission) => (
                      <FormControlLabel
                        key={permission}
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(permission)}
                            onChange={() => handleTogglePermission(permission)}
                          />
                        }
                        label={permission.replace(/_/g, ' ')}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePermissions}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

