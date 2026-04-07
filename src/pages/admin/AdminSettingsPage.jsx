import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import api from "../../lib/api";
import {
  adminAlertSx,
  adminContainedPrimarySx,
  adminOuterPaperSx,
  adminOutlinedInputSx,
} from "../../admin/adminStyles";
import AdminSectionHeader from "../../components/AdminSectionHeader";
import AppButton from "../../components/AppButton";

const empty = { siteName: "", supportEmail: "", supportPhone: "" };

export default function AdminSettingsPage() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const res = await api.get("/api/admin/settings");
        const s = res.data.settings || {};
        if (!cancelled) {
          setForm({
            siteName: s.siteName ?? "",
            supportEmail: s.supportEmail ?? "",
            supportPhone: s.supportPhone ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Could not load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put("/api/admin/settings", form);
      setSuccess("Settings saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <AdminSectionHeader
        title="Settings"
        subtitle="Platform-wide labels and contact details shown to your team (extend as needed)."
      />

      <Paper
        elevation={0}
        component="form"
        onSubmit={onSubmit}
        sx={{
          ...adminOuterPaperSx,
          maxWidth: 640,
          width: "100%",
          mx: "auto",
        }}
      >
        {error ? (
          <Alert severity="error" sx={adminAlertSx}>
            {error}
          </Alert>
        ) : null}
        {success ? (
          <Alert severity="success" sx={adminAlertSx} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        ) : null}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <TextField
              name="siteName"
              label="Site name"
              value={form.siteName}
              onChange={onChange}
              fullWidth
              size="small"
              helperText="Displayed in admin branding and can be reused in the member app later."
              sx={adminOutlinedInputSx}
            />
            <TextField
              name="supportEmail"
              label="Support email"
              type="email"
              value={form.supportEmail}
              onChange={onChange}
              fullWidth
              size="small"
              sx={adminOutlinedInputSx}
            />
            <TextField
              name="supportPhone"
              label="Support phone"
              value={form.supportPhone}
              onChange={onChange}
              fullWidth
              size="small"
              sx={adminOutlinedInputSx}
            />
            <AppButton type="submit" variant="contained" disabled={saving} sx={{ ...adminContainedPrimarySx, alignSelf: "flex-start", mt: 0.5 }}>
              {saving ? "Saving…" : "Save settings"}
            </AppButton>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
