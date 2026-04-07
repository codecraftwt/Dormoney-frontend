import { createTheme } from "@mui/material/styles";

/** Single source of truth for brand colors — import `colors` in components or use MUI `theme.palette`. */
export const colors = {
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  pageBg: "#f8fafc",
  paper: "#ffffff",
  border: "#e2e8f0",
  borderSubtle: "#f1f5f9",
  heading: "#0f172a",
  bodyMuted: "#334155",
  muted: "#64748b",
  error: "#dc2626",
};

export const appTheme = createTheme({
  palette: {
    primary: { main: colors.primary, dark: colors.primaryDark },
    error: { main: colors.error },
    background: { default: colors.pageBg, paper: colors.paper },
    text: { primary: colors.heading, secondary: colors.bodyMuted },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});
