import { Box, Button, Stack, Typography } from "@mui/material";
import useAuth from "../hooks/useAuth";

export default function AdminSectionHeader({ title, subtitle }) {
  const { logout } = useAuth();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "flex-start" }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: -0.5 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Button variant="contained" onClick={logout} sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}>
        Logout
      </Button>
    </Stack>
  );
}
