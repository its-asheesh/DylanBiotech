// src/pages/Users.tsx
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
  Grid,
  Pagination,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit,
  Visibility,
  Delete,
  Restore,
  Search,
  FilterList,
  MoreVert,
  Person,
  AdminPanelSettings,
  Phone,
  PhoneDisabled,
  CalendarToday,
} from '@mui/icons-material';
import {
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  restoreUser,
  type User,
} from '../services/userApi';
import { useAuth } from '../context/AuthContext';
import type { AdminLevel } from '../services/adminApi';

const ADMIN_LEVEL_LABELS: Record<AdminLevel, string> = {
  1: 'Moderator',
  2: 'Admin',
  3: 'Super Admin',
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'user' | 'admin' | ''>('');
  const [deletedFilter, setDeletedFilter] = useState<'all' | 'active' | 'deleted'>('active');
  const [hasPhoneFilter, setHasPhoneFilter] = useState<boolean | ''>('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'role' | 'deletedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newAdminLevel, setNewAdminLevel] = useState<AdminLevel>(2);
  const [hardDelete, setHardDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  // Check permissions
  const canViewUsers = currentUser?.permissions?.includes('view_users') || currentUser?.adminLevel === 3;
  const canManageUsers = currentUser?.permissions?.includes('manage_users') || currentUser?.adminLevel === 3;
  const canDeleteUsers = currentUser?.permissions?.includes('delete_users') || currentUser?.adminLevel === 3;
  const canManageRoles = currentUser?.permissions?.includes('manage_user_roles') || currentUser?.adminLevel === 3;

  useEffect(() => {
    if (canViewUsers) {
      loadUsers();
    } else {
      setError('Access denied. You do not have permission to view users.');
      setLoading(false);
    }
  }, [page, search, roleFilter, deletedFilter, hasPhoneFilter, createdFrom, createdTo, sortBy, sortOrder, canViewUsers]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listUsers({
        page,
        limit: 10,
        role: roleFilter || undefined,
        search: search || undefined,
        includeDeleted: deletedFilter === 'all',
        onlyDeleted: deletedFilter === 'deleted',
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        hasPhone: hasPhoneFilter !== '' ? hasPhoneFilter : undefined,
        sortBy,
        sortOrder,
      });
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await getUserById(userId);
      setSelectedUser(response.user);
      setViewDialogOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
    }
  };

  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewAdminLevel(user.adminLevel || 2);
    setRoleDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setHardDelete(false);
    setDeleteDialogOpen(true);
  };

  const handleOpenRestoreDialog = (user: User) => {
    setSelectedUser(user);
    setRestoreDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setError(null);
      await updateUserRole(selectedUser._id, {
        role: newRole,
        adminLevel: newRole === 'admin' ? newAdminLevel : undefined,
      });
      setSuccess(`User role updated to ${newRole}${newRole === 'admin' ? ` (${ADMIN_LEVEL_LABELS[newAdminLevel]})` : ''}`);
      setRoleDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setError(null);
      await deleteUser(selectedUser._id, hardDelete);
      setSuccess(hardDelete ? 'User permanently deleted' : 'User deleted successfully');
      setDeleteDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setError(null);
      await restoreUser(selectedUser._id);
      setSuccess('User restored successfully');
      setRestoreDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to restore user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuUserId(null);
  };

  const handleFilterReset = () => {
    setSearch('');
    setRoleFilter('');
    setDeletedFilter('active');
    setHasPhoneFilter('');
    setCreatedFrom('');
    setCreatedTo('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  if (!canViewUsers) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">Access denied. You do not have permission to view users.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Users Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterReset}
          >
            Reset Filters
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value as 'user' | 'admin' | '')}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={deletedFilter}
                  label="Status"
                  onChange={(e) => setDeletedFilter(e.target.value as 'all' | 'active' | 'deleted')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="deleted">Deleted</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Phone</InputLabel>
                <Select
                  value={hasPhoneFilter}
                  label="Phone"
                  onChange={(e) => setHasPhoneFilter(e.target.value === '' ? '' : e.target.value === 'true')}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Has Phone</MenuItem>
                  <MenuItem value="false">No Phone</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="role">Role</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <MenuItem value="desc">Descending</MenuItem>
                  <MenuItem value="asc">Ascending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Created From"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Created To"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Stats */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`Total: ${total}`} color="primary" variant="outlined" />
            <Chip
              label={`Users: ${users.filter(u => u.role === 'user').length}`}
              icon={<Person />}
              variant="outlined"
            />
            <Chip
              label={`Admins: ${users.filter(u => u.role === 'admin').length}`}
              icon={<AdminPanelSettings />}
              variant="outlined"
            />
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
                      <TableCell>Phone</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" sx={{ py: 2 }}>
                            No users found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {user.role === 'admin' ? (
                                <AdminPanelSettings color="primary" />
                              ) : (
                                <Person color="action" />
                              )}
                              <Typography fontWeight="medium">{user.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email || 'N/A'}</TableCell>
                          <TableCell>
                            {user.phone ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Phone fontSize="small" color="success" />
                                <Typography variant="body2">{user.phone}</Typography>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PhoneDisabled fontSize="small" color="disabled" />
                                <Typography variant="body2" color="text.secondary">
                                  No phone
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.role === 'admin' ? (
                              <Chip
                                label={
                                  user.adminLevel
                                    ? ADMIN_LEVEL_LABELS[user.adminLevel]
                                    : 'Admin'
                                }
                                color="primary"
                                size="small"
                              />
                            ) : (
                              <Chip label="User" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarToday fontSize="small" color="action" />
                              <Typography variant="body2">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {user.isDeleted ? (
                              <Chip label="Deleted" color="error" size="small" />
                            ) : (
                              <Chip label="Active" color="success" size="small" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewUser(user._id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {canManageRoles && !user.isDeleted && (
                              <Tooltip title="Change Role">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenRoleDialog(user)}
                                  color="primary"
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canDeleteUsers && !user.isDeleted && (
                              <Tooltip title="Delete User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeleteDialog(user)}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canManageUsers && user.isDeleted && (
                              <Tooltip title="Restore User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenRestoreDialog(user)}
                                  color="success"
                                >
                                  <Restore />
                                </IconButton>
                              </Tooltip>
                            )}
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

      {/* View User Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{selectedUser.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedUser.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{selectedUser.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Role
                  </Typography>
                  {selectedUser.role === 'admin' ? (
                    <Chip
                      label={
                        selectedUser.adminLevel
                          ? ADMIN_LEVEL_LABELS[selectedUser.adminLevel]
                          : 'Admin'
                      }
                      color="primary"
                    />
                  ) : (
                    <Chip label="User" />
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  {selectedUser.isDeleted ? (
                    <Chip label="Deleted" color="error" />
                  ) : (
                    <Chip label="Active" color="success" />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                {selectedUser.isDeleted && selectedUser.deletedAt && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Deleted At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedUser.deletedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedUser && canManageRoles && !selectedUser.isDeleted && (
            <Button
              variant="contained"
              onClick={() => {
                setViewDialogOpen(false);
                handleOpenRoleDialog(selectedUser);
              }}
            >
              Change Role
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                User: <strong>{selectedUser.name}</strong>
              </Typography>
              <FormControl fullWidth sx={{ mt: 3, mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newRole}
                  label="Role"
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              {newRole === 'admin' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Admin Level</InputLabel>
                  <Select
                    value={newAdminLevel}
                    label="Admin Level"
                    onChange={(e) => setNewAdminLevel(e.target.value as AdminLevel)}
                  >
                    <MenuItem value={1}>Moderator</MenuItem>
                    <MenuItem value={2}>Admin</MenuItem>
                    <MenuItem value={3}>Super Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
              {newRole === 'admin' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Promoting to admin will grant default permissions for the selected level.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateRole}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to delete <strong>{selectedUser.name}</strong>?
              </Alert>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                By default, this will perform a soft delete. The user account will be marked as
                deleted but can be restored later.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <input
                  type="checkbox"
                  id="hardDelete"
                  checked={hardDelete}
                  onChange={(e) => setHardDelete(e.target.checked)}
                />
                <label htmlFor="hardDelete" style={{ marginLeft: 8 }}>
                  Permanently delete (cannot be restored)
                </label>
              </Box>
              {hardDelete && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Warning: Permanent deletion cannot be undone!
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore User Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Restore User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Are you sure you want to restore <strong>{selectedUser.name}</strong>?
              </Alert>
              <Typography variant="body2" color="text.secondary">
                This will restore the user account and they will be able to login again.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleRestoreUser}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Restore User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
