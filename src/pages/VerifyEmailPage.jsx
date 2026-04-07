import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import api from "../lib/api";
import AppButton from "../components/AppButton";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (!token) {
      setError("Missing verification token.");
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/verify-email", { params: { token } })
      .then((res) => {
        setSuccess(res.data.message || "Email verified successfully.");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not verify email.");
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, bgcolor: "#f8fafc" }}>
      <Paper sx={{ width: "100%", maxWidth: 560, p: 4, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            Verify your email
          </Typography>
          {loading ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Checking your verification link...</Typography>
            </Stack>
          ) : null}
          {!loading && success ? <Alert severity="success">{success}</Alert> : null}
          {!loading && error ? <Alert severity="error">{error}</Alert> : null}
          <AppButton variant="contained" onClick={() => navigate("/login")}>
            Go to sign in
          </AppButton>
        </Stack>
      </Paper>
    </Box>
  );
}
