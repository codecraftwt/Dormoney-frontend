import { Box, Paper, Typography } from "@mui/material";
import AdminSectionHeader from "../../components/AdminSectionHeader";

export default function AdminDashboardPage() {
  return (
    <Box>
      <AdminSectionHeader
        title="Dashboard"
        subtitle="Overview of platform activity and quick access to common tasks."
      />
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Dormoney admin area. Use the sidebar to open Users, Scholarships, and other
          sections. More metrics and widgets can be added here as the product grows.
        </Typography>
      </Paper>
    </Box>
  );
}
