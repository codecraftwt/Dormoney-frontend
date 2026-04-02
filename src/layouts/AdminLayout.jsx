import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import { NavLink, Outlet } from "react-router-dom";

const DRAWER_WIDTH = 260;

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> },
  { to: "/admin/users", label: "Users / Members", icon: <PeopleIcon fontSize="small" /> },
  { to: "/admin/admins", label: "Admin Management", icon: <VerifiedUserIcon fontSize="small" /> },
  { to: "/admin/scholarships", label: "Scholarships", icon: <SchoolIcon fontSize="small" /> },
  { to: "/admin/settings", label: "Settings", icon: <SettingsIcon fontSize="small" /> },
];

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f6fb" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "#fafbfc",
          },
        }}
      >
        <Toolbar sx={{ px: 2, py: 2, alignItems: "center" }}>
          <AdminPanelSettingsIcon sx={{ color: "primary.main", mr: 1, fontSize: 28 }} />
          <Typography variant="h6" fontWeight={800} color="primary">
            Dormoney
          </Typography>
        </Toolbar>
        <List sx={{ px: 1.5, pt: 0 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                py: 1.25,
                "&.active": {
                  bgcolor: "action.selected",
                  borderLeft: "4px solid",
                  borderColor: "primary.main",
                  pl: 1.5,
                },
                "&.active .MuiListItemIcon-root": {
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, md: 3 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
