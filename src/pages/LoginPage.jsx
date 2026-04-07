import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";
import AppButton from "../components/AppButton";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, loading: authLoading, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    navigate(user?.onboarding_complete ? "/dashboard" : "/onboarding", { replace: true });
  }, [authLoading, isAuthenticated, isAdmin, navigate, user?.onboarding_complete]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/api/auth/login", form);
      login(res.data);
      navigate(res.data.user?.onboarding_complete ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#f8fafc",
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            borderBottom: "1px solid #f1f5f9",
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 32, color: "#334155" }} />
          </Box>

          <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to continue to your dashboard
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ p: 4 }}
        >
          <Stack spacing={3}>
            <TextField
              name="email"
              type="email"
              label="Email address"
              value={form.email}
              onChange={onChange}
              required
              fullWidth
              autoComplete="email"
              autoFocus
              size="medium"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={form.password}
              onChange={onChange}
              required
              fullWidth
              autoComplete="current-password"
              size="medium"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Remember me
                  </Typography>
                }
              />

              <Link
                to="/forgot-password"
                style={{ textDecoration: "none" }}
              >
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    "&:hover": { textDecoration: "underline" },
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </Typography>
              </Link>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <AppButton
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LoginRoundedIcon />
                )
              }
              sx={{
                py: 1.6,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1.05rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </AppButton>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}
            >
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "inherit", fontWeight: 600 }}>
                Create one now
              </Link>
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Administrator?{" "}
              <Link to="/admin/login" style={{ color: "inherit", fontWeight: 600 }}>
                Admin sign in
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}