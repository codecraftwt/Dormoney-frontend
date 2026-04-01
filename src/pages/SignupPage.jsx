import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/api/auth/signup", form);
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
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
            Create account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign up to start exploring scholarships
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ p: 4 }}>
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
              minLength={6}
              fullWidth
              autoComplete="new-password"
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
            <TextField
              name="phone"
              type="text"
              label="Phone number"
              value={form.phone}
              onChange={onChange}
              required
              fullWidth
              size="medium"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <PersonAddAlt1RoundedIcon />
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
              {submitting ? "Creating account..." : "Create account"}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}
            >
              Have an account?{" "}
              <Link to="/login" style={{ color: "inherit", fontWeight: 600 }}>
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );               
}
