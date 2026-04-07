import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";
import AppButton from "../components/AppButton";

export default function SignupPage() {
  const termsUrl = import.meta.env.VITE_TERMS_URL || "https://dormoney.com/terms";
  const privacyUrl = import.meta.env.VITE_PRIVACY_URL || "https://dormoney.com/privacy";
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    account_type: "student",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    sms_opt_in: true,
    acceptedTerms: false,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const accountLabel = form.account_type === "parent" ? "your child's GPA" : "your GPA";
  const isValidPassword = (password) =>
    String(password || "").length >= 8 && /\d/.test(String(password || ""));

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextForm = {
      ...form,
      [name]: name === "phone" ? formatPhone(value) : type === "checkbox" ? checked : value,
    };
    setForm(nextForm);

    const nextFieldErrors = { ...fieldErrors };
    const validateSingleField = (fieldName) => {
      if (fieldName === "email") {
        if (!nextForm.email.trim()) nextFieldErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextForm.email)) {
          nextFieldErrors.email = "Please enter a valid email address";
        } else {
          delete nextFieldErrors.email;
        }
      }

      if (fieldName === "password") {
        if (!nextForm.password) nextFieldErrors.password = "Password is required";
        else if (!isValidPassword(nextForm.password)) {
          nextFieldErrors.password =
            "Password must be at least 8 characters and include at least 1 number";
        } else {
          delete nextFieldErrors.password;
        }
      }

      if (fieldName === "confirmPassword") {
        if (!nextForm.confirmPassword) {
          nextFieldErrors.confirmPassword = "Please confirm your password";
        } else if (nextForm.password !== nextForm.confirmPassword) {
          nextFieldErrors.confirmPassword = "Passwords do not match";
        } else {
          delete nextFieldErrors.confirmPassword;
        }
      }

      if (fieldName === "phone") {
        if (nextForm.phone.replace(/\D/g, "").length !== 10) {
          nextFieldErrors.phone = "Please enter a valid 10-digit mobile number";
        } else {
          delete nextFieldErrors.phone;
        }
      }

      if (fieldName === "acceptedTerms") {
        if (!nextForm.acceptedTerms) {
          nextFieldErrors.acceptedTerms =
            "You must agree to the Terms of Service and Privacy Policy";
        } else {
          delete nextFieldErrors.acceptedTerms;
        }
      }
    };

    validateSingleField(name);
    if (name === "password") validateSingleField("confirmPassword");
    setFieldErrors(nextFieldErrors);
  };

  const validateFields = () => {
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Please enter a valid email address";
    }
    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (!isValidPassword(form.password)) {
      nextErrors.password = "Password must be at least 8 characters and include at least 1 number";
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      nextErrors.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!form.acceptedTerms) {
      nextErrors.acceptedTerms = "You must agree to the Terms of Service and Privacy Policy";
    }
    return nextErrors;
  };
  const isFormReady =
    form.email.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    isValidPassword(form.password) &&
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword &&
    form.phone.replace(/\D/g, "").length === 10 &&
    form.acceptedTerms;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const nextErrors = validateFields();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/api/auth/register", {
        email: form.email,
        password: form.password,
        phone: form.phone,
        sms_opt_in: form.sms_opt_in,
        account_type: form.account_type,
      });
      login(res.data);
      navigate("/onboarding");
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      if (message.toLowerCase().includes("email")) {
        setFieldErrors((prev) => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes("password")) {
        setFieldErrors((prev) => ({ ...prev, password: message }));
      } else if (message.toLowerCase().includes("phone") || message.toLowerCase().includes("mobile")) {
        setFieldErrors((prev) => ({ ...prev, phone: message }));
      } else {
        setError(message);
      }
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
        p: { xs: "16px", sm: 4 },
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
            p: { xs: "16px", sm: 4 },
            textAlign: "center",
            borderBottom: "1px solid #f1f5f9",
            bgcolor: "#ffffff",
          }}
        >
          <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
            Create account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start with the basics, then finish onboarding in a few quick steps.
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ p: { xs: "16px", sm: 4 } }}>
          <Stack spacing={3}>
            <ToggleButtonGroup
              exclusive
              value={form.account_type}
              onChange={(_, nextType) =>
                nextType && setForm((prev) => ({ ...prev, account_type: nextType }))
              }
              fullWidth
            >
              <ToggleButton value="student">I'm a Student</ToggleButton>
              <ToggleButton value="parent">I'm a Parent</ToggleButton>
            </ToggleButtonGroup>
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
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email || undefined}
              FormHelperTextProps={{
                sx: { color: "#dc2626", fontWeight: 500, mt: 0.5 },
              }}
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
              minLength={8}
              fullWidth
              autoComplete="new-password"
              size="medium"
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password || undefined}
              FormHelperTextProps={{
                sx: { color: "#dc2626", fontWeight: 500, mt: 0.5 },
              }}
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
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm password"
              value={form.confirmPassword}
              onChange={onChange}
              required
              fullWidth
              autoComplete="new-password"
              error={Boolean(fieldErrors.confirmPassword)}
              helperText={fieldErrors.confirmPassword || undefined}
              FormHelperTextProps={{
                sx: { color: "#dc2626", fontWeight: 500, mt: 0.5 },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="phone"
              type="text"
              label="Mobile number"
              value={form.phone}
              onChange={onChange}
              required
              fullWidth
              placeholder="(555) 555-5555"
              size="medium"
              error={Boolean(fieldErrors.phone)}
              helperText={fieldErrors.phone || undefined}
              FormHelperTextProps={{
                sx: { color: "#dc2626", fontWeight: 500, mt: 0.5 },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <FormControlLabel
              control={<Checkbox name="sms_opt_in" checked={form.sms_opt_in} onChange={onChange} />}
              label="Yes, send me scholarship deadline reminders and updates via text."
            />
            <FormControlLabel
              control={<Checkbox name="acceptedTerms" checked={form.acceptedTerms} onChange={onChange} />}
              label={
                <Typography variant="body2" color="text.secondary">
                  By creating an account you agree to our{" "}
                  <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                  .
                </Typography>
              }
            />
            {fieldErrors.acceptedTerms ? (
              <Typography
                variant="caption"
                sx={{ mt: -1, color: "#dc2626", fontWeight: 500 }}
              >
                {fieldErrors.acceptedTerms}
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.secondary">
              We will use {accountLabel} and profile details to personalize scholarship matching.
            </Typography>

            {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}

            <AppButton
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting || !isFormReady}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
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
            </AppButton>

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
