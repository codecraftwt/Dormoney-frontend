import { Box, Paper, Typography } from "@mui/material";
import AdminSectionHeader from "../../components/AdminSectionHeader";

export default function AdminUsersPage() {
  return (
    <Box>
      <AdminSectionHeader
        title="Users / Members"
        subtitle="View and manage registered members and their accounts."
      />
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Member management tools will appear here (search, roles, activity). This section is ready to
          connect to your user APIs when available.
        </Typography>
      </Paper>
    </Box>
  );
}
