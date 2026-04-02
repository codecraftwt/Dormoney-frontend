import { Box, Paper, Typography } from "@mui/material";
import AdminSectionHeader from "../../components/AdminSectionHeader";

export default function AdminManagementPage() {
  return (
    <Box>
      <AdminSectionHeader
        title="Admin Management"
        subtitle="Control who can access this admin panel and what they can do."
      />
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Admin invites, roles, and audit logs can live here. Hook this section up to your auth service
          when you are ready to delegate access beyond a single admin account.
        </Typography>
      </Paper>
    </Box>
  );
}
