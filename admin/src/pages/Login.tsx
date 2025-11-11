// src/pages/Login.tsx
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
} from '@mui/icons-material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      await login({ email, password });
      // Navigation is handled by AuthContext after successful login
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: 4,
              textAlign: 'center',
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Admin Portal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Sign in to access the admin dashboard
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
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
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Forgot your password? Contact your system administrator.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
            © 2024 DylanBiotech Admin Portal. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

