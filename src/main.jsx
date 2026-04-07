import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { appTheme, colors } from "./theme";
import "./styles.css";
import "react-toastify/dist/ReactToastify.css";

const globalCssVars = {
  "--color-primary": colors.primary,
  "--color-primary-dark": colors.primaryDark,
  "--color-page-bg": colors.pageBg,
  "--color-paper": colors.paper,
  "--color-border": colors.border,
  "--color-border-subtle": colors.borderSubtle,
  "--color-text-primary": colors.heading,
  "--color-text-secondary": colors.bodyMuted,
  "--color-muted": colors.muted,
  "--color-error": colors.error,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles styles={{ ":root": globalCssVars, body: { backgroundColor: colors.pageBg } }} />
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
