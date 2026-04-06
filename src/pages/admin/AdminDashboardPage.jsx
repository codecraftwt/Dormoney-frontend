import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../../lib/api";
import { adminAlertSx } from "../../admin/adminStyles";
import useAuth from "../../hooks/useAuth";

const PAGE_BG = "#f3f6fb";
const ICON_BOX_BG = "#e8f4fc";
const PRIMARY_BLUE = "#2563eb";

const cardShellSx = {
  bgcolor: "#fff",
  borderRadius: 2,
  border: "1px solid",
  borderColor: "rgba(15, 23, 42, 0.06)",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
  boxSizing: "border-box",
};

function IconBox({ children }) {
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2,
        bgcolor: ICON_BOX_BG,
        display: "grid",
        placeItems: "center",
        color: PRIMARY_BLUE,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

/** Single number + label — no trend placeholders. */
function StatCard({ label, value, icon }) {
  return (
    <Paper elevation={0} sx={{ ...cardShellSx, p: 2.5, width: "100%", height: "100%" }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <IconBox>{icon}</IconBox>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 0.5 }}
          >
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ color: PRIMARY_BLUE, letterSpacing: -0.5, lineHeight: 1.15 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

const QUICK_ACTIONS = [
  { to: "/admin/users", label: "Members", sub: "Directory & roles", icon: <PeopleOutlineIcon /> },
  { to: "/admin/scholarships", label: "Scholarships", sub: "Records & status", icon: <SchoolOutlinedIcon /> },
  { to: "/admin/admins", label: "Admins", sub: "Access control", icon: <AdminPanelSettingsOutlinedIcon /> },
  { to: "/admin/settings", label: "Settings", sub: "Site & contact", icon: <StarOutlineIcon /> },
];

function QuickActionsGrid() {
  return (
    <Paper elevation={0} sx={{ ...cardShellSx, p: 2.5, width: "100%", boxSizing: "border-box" }}>
      <Typography fontWeight={700} fontSize="1.05rem">
        Quick actions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 0.25 }}>
        Jump to any section instantly
      </Typography>
      <Grid container spacing={2.5} sx={{ width: "100%", mx: 0 }}>
        {QUICK_ACTIONS.map((a) => (
          <Grid item xs={12} sm={6} lg={3} key={a.label + a.to}>
            <Button
              fullWidth
              component={RouterLink}
              to={a.to}
              sx={{
                justifyContent: "space-between",
                textAlign: "left",
                py: 1.25,
                px: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fafbfc",
                textTransform: "none",
                color: "text.primary",
                "&:hover": { bgcolor: "#f1f5f9", borderColor: PRIMARY_BLUE },
              }}
              endIcon={<ChevronRightIcon sx={{ color: "text.disabled", fontSize: 20 }} />}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <Box sx={{ color: PRIMARY_BLUE, display: "flex" }}>{a.icon}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} fontSize="0.8rem" noWrap>
                    {a.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {a.sub}
                  </Typography>
                </Box>
              </Stack>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const displayName = user?.email?.split("@")[0] || "Admin";
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const statsRes = await api.get("/api/admin/stats");
        if (!cancelled) setData(statsRes.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Could not load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatKpi = (n) => (typeof n === "number" ? n.toLocaleString() : n ?? "—");

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        width: "100%",
        alignSelf: "stretch",
        bgcolor: PAGE_BG,
        m: { xs: -2, md: -3 },
        p: { xs: 2, md: 3 },
        boxSizing: "border-box",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.3, color: "#0f172a" }}>
            Welcome back, {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {todayLabel}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
            alignSelf: { xs: "stretch", sm: "flex-start" },
          }}
        >
          Logout
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ ...adminAlertSx, mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: 240 }}>
          <CircularProgress size={36} />
        </Stack>
      ) : null}

      {!loading && data ? (
        <Stack spacing={3.5} sx={{ flex: 1, width: "100%", alignSelf: "stretch" }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.04em" }}>
            Overview
          </Typography>
          <Grid container spacing={3} alignItems="stretch" sx={{ width: "100%", mx: 0 }}>
            <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
              <StatCard
                label="Total users"
                value={formatKpi(data.users?.total)}
                icon={<PeopleOutlineIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
              <StatCard
                label="Total scholarships"
                value={formatKpi(data.scholarships?.total)}
                icon={<SchoolOutlinedIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
              <StatCard
                label="Active scholarships"
                value={formatKpi(data.scholarships?.active)}
                icon={<ToggleOnOutlinedIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
              <StatCard
                label="Inactive scholarships"
                value={formatKpi(data.scholarships?.inactive)}
                icon={<ToggleOffOutlinedIcon />}
              />
            </Grid>
          </Grid>

          <Box sx={{ width: "100%", alignSelf: "stretch" }}>
            <QuickActionsGrid />
          </Box>
        </Stack>
      ) : null}
    </Box>
  );
}
