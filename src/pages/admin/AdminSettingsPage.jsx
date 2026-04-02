import { Box, Paper, Typography } from "@mui/material";
import AdminSectionHeader from "../../components/AdminSectionHeader";

export default function AdminSettingsPage() {
  return (
    <Box>
      <AdminSectionHeader title="Settings" subtitle="Configure platform-wide preferences and integrations." />
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Add branding, notification defaults, API keys, and environment-specific options here as your
          admin needs expand.
        </Typography>
      </Paper>
    </Box>
  );
}
