import { useEffect, useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import api from "../lib/api";
import { CATEGORIES } from "../constants";
import useAuth from "../hooks/useAuth";

const COLORS = {
  primary: "#3B82F6",
  heading: "#1E293B",
  muted: "#64748B",
  pageBg: "#F1F5F9",
  /** Card fill: bottom → top (darker sky → light; contrast high enough to read as a gradient) */
  cardGradientBottom: "#7DD3FC",
  cardGradientMid: "#BAE6FD",
  cardGradientTop: "#F0F9FF",
  border: "#E2E8F0",
};

const font = '"Inter", system-ui, -apple-system, sans-serif';

const initialFilters = {
  categories: [],
  amountRanges: [],
  deadlineStart: "",
  deadlineEnd: "",
};

const formatDeadline = (deadline) => {
  if (!deadline) return "—";
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");

  const fetchScholarships = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = { activeOnly: true };
      if (nextFilters.categories.length) {
        params.categories = nextFilters.categories.join(",");
      }
      if (nextFilters.amountRanges.length) {
        params.amountRanges = nextFilters.amountRanges.join(",");
      }
      if (nextFilters.deadlineStart) {
        params.deadlineStart = nextFilters.deadlineStart;
      }
      if (nextFilters.deadlineEnd) {
        params.deadlineEnd = nextFilters.deadlineEnd;
      }
      const res = await api.get("/api/scholarships", { params });
      setScholarships(res.data.scholarships);
    } catch (err) {
      const message = err.response?.data?.message || "Could not load scholarships";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships(initialFilters);
  }, []);

  const toggleArrayValue = (key, value) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);
      const nextFilters = {
        ...prev,
        [key]: exists ? prev[key].filter((v) => v !== value) : [...prev[key], value],
      };
      const hasAnyFilter =
        nextFilters.categories.length > 0 ||
        nextFilters.amountRanges.length > 0 ||
        Boolean(nextFilters.deadlineStart) ||
        Boolean(nextFilters.deadlineEnd);
      if (!hasAnyFilter) {
        fetchScholarships(nextFilters);
      }
      return nextFilters;
    });
  };

  const onResetFilters = () => {
    setFilters(initialFilters);
    fetchScholarships(initialFilters);
  };

  const onAiSearch = async (e) => {
    e.preventDefault();
    setError("");
    if (!searchText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/api/ai/search", { query: searchText.trim() });
      setScholarships(res.data.scholarships);
      setFilters((prev) => ({
        ...prev,
        categories: res.data.filters.categories || [],
        amountRanges: res.data.filters.amountRanges || [],
        deadlineStart: res.data.filters.deadlineStart || "",
        deadlineEnd: res.data.filters.deadlineEnd || "",
      }));
    } catch (err) {
      const message = err.response?.data?.message || "AI search failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        fontFamily: font,
        p: { xs: 1.5, md: 2.5 },
        bgcolor: COLORS.pageBg,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, md: 3 },
          gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 0.26fr) 1fr" },
          alignItems: "start",
          maxWidth: 1440,
          mx: "auto",
        }}
      >
        {/* Sidebar */}
        <Box>
          <Typography
            sx={{
              fontFamily: font,
              fontWeight: 800,
              fontSize: "1.35rem",
              color: COLORS.primary,
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            Dormoney
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: "#fff",
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
              position: { md: "sticky" },
              top: 16,
            }}
          >
            <Typography
              sx={{
                fontFamily: font,
                fontWeight: 700,
                fontSize: "1rem",
                color: COLORS.heading,
              }}
            >
              Filters
            </Typography>
            <Typography
              sx={{
                fontFamily: font,
                fontSize: "0.8125rem",
                color: COLORS.muted,
                mb: 1.5,
                display: "block",
              }}
            >
              Narrow down scholarship results
            </Typography>
            <Divider sx={{ borderColor: COLORS.border, mb: 2 }} />

            <Typography
              sx={{
                fontFamily: font,
                fontWeight: 700,
                fontSize: "0.875rem",
                color: COLORS.heading,
                mb: 1,
              }}
            >
              Category
            </Typography>
            <Stack spacing={0.25} sx={{ mb: 2 }}>
              {CATEGORIES.map((category) => (
                <FormControlLabel
                  key={category}
                  sx={{ ml: 0, "& .MuiFormControlLabel-label": { fontSize: "0.875rem", color: COLORS.heading } }}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleArrayValue("categories", category)}
                      sx={{
                        color: "#CBD5E1",
                        borderRadius: "6px",
                        "&.Mui-checked": { color: COLORS.primary },
                      }}
                    />
                  }
                  label={category}
                />
              ))}
            </Stack>

            <Typography
              sx={{
                fontFamily: font,
                fontWeight: 700,
                fontSize: "0.875rem",
                color: COLORS.heading,
                mb: 1,
              }}
            >
              Deadline Range
            </Typography>
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <TextField
                size="small"
                type="date"
                label="From"
                placeholder="mm/dd/yyyy"
                InputLabelProps={{ shrink: true }}
                value={filters.deadlineStart}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => {
                    const nextFilters = { ...prev, deadlineStart: value };
                    const hasAnyFilter =
                      nextFilters.categories.length > 0 ||
                      nextFilters.amountRanges.length > 0 ||
                      Boolean(nextFilters.deadlineStart) ||
                      Boolean(nextFilters.deadlineEnd);
                    if (!hasAnyFilter) {
                      fetchScholarships(nextFilters);
                    }
                    return nextFilters;
                  });
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarMonthIcon sx={{ color: COLORS.muted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontFamily: font,
                    bgcolor: "#fff",
                  },
                }}
              />
              <TextField
                size="small"
                type="date"
                label="To"
                placeholder="mm/dd/yyyy"
                InputLabelProps={{ shrink: true }}
                value={filters.deadlineEnd}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => {
                    const nextFilters = { ...prev, deadlineEnd: value };
                    const hasAnyFilter =
                      nextFilters.categories.length > 0 ||
                      nextFilters.amountRanges.length > 0 ||
                      Boolean(nextFilters.deadlineStart) ||
                      Boolean(nextFilters.deadlineEnd);
                    if (!hasAnyFilter) {
                      fetchScholarships(nextFilters);
                    }
                    return nextFilters;
                  });
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarMonthIcon sx={{ color: COLORS.muted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontFamily: font,
                    bgcolor: "#fff",
                  },
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Button
                fullWidth
                onClick={() => fetchScholarships()}
                sx={{
                  fontFamily: font,
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: "10px",
                  py: 1.25,
                  bgcolor: COLORS.primary,
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#2563EB", boxShadow: "none" },
                }}
              >
                Apply
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={onResetFilters}
                sx={{
                  fontFamily: font,
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: "10px",
                  py: 1.25,
                  borderColor: COLORS.primary,
                  color: COLORS.primary,
                  bgcolor: "#fff",
                  "&:hover": {
                    borderColor: COLORS.primary,
                    bgcolor: "rgba(59, 130, 246, 0.06)",
                  },
                }}
              >
                Reset
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* Main */}
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: font,
                  fontWeight: 700,
                  fontSize: { xs: "1.5rem", md: "1.875rem" },
                  color: COLORS.heading,
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                Welcome back, {user?.email?.split("@")[0] || "User"}
              </Typography>
              <Typography sx={{ fontFamily: font, fontSize: "0.9375rem", color: COLORS.muted }}>
                {user?.email}
              </Typography>
            </Box>
            <Tooltip title="Logout">
              <Button
                variant="outlined"
                onClick={logout}
                aria-label="Logout"
                sx={{
                  fontFamily: font,
                  minWidth: 44,
                  px: 1.5,
                  py: 1,
                  borderColor: COLORS.border,
                  color: COLORS.muted,
                  borderRadius: "10px",
                  "&:hover": { borderColor: COLORS.primary, color: COLORS.primary },
                }}
              >
                <LogoutIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Stack>

          <Paper
            component="form"
            onSubmit={onAiSearch}
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "stretch",
              flexWrap: { xs: "wrap", sm: "nowrap" },
              borderRadius: "999px",
              border: `1px solid ${COLORS.border}`,
              bgcolor: "#fff",
              overflow: "hidden",
              mb: 2.5,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              placeholder="Ask anything! Find scholarships tailored to you. Try 'Scholarships 1 for business majors under $5,000'"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: COLORS.muted, ml: 0.5 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                px: { xs: 1.5, sm: 2 },
                py: 1.25,
                "& .MuiInputBase-input": {
                  fontFamily: font,
                  fontSize: "0.875rem",
                  color: COLORS.heading,
                  "&::placeholder": {
                    color: COLORS.muted,
                    opacity: 1,
                  },
                },
              }}
            />
            <Button
              type="submit"
              disabled={loading || !searchText.trim()}
              sx={{
                fontFamily: font,
                fontWeight: 600,
                px: { xs: 2, sm: 3.5 },
                py: 1.5,
                borderRadius: 0,
                bgcolor: COLORS.primary,
                color: "#fff",
                textTransform: "none",
                fontSize: "1rem",
                minWidth: { xs: "100%", sm: 100 },
                "&:hover": { bgcolor: "#2563EB" },
                "&.Mui-disabled": { bgcolor: "#93C5FD", color: "#fff" },
              }}
            >
              Ask
            </Button>
          </Paper>

          {error ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontFamily: font }}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress sx={{ color: COLORS.primary }} />
            </Stack>
          ) : null}

          {!loading && scholarships.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                border: `1px solid ${COLORS.border}`,
                bgcolor: "#fff",
                p: 4,
              }}
            >
              <Stack spacing={1.25} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "#E0F2FE",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <SearchOffIcon sx={{ color: COLORS.primary }} />
                </Box>
                <Typography sx={{ fontFamily: font, fontWeight: 700, fontSize: "1.125rem", color: COLORS.heading }}>
                  No results found
                </Typography>
                <Typography sx={{ fontFamily: font, fontSize: "0.875rem", color: COLORS.muted }}>
                  We could not find scholarships matching your current search or filters.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={onResetFilters}
                  sx={{
                    fontFamily: font,
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Clear filters
                </Button>
              </Stack>
            </Paper>
          ) : null}

          {!loading && scholarships.length > 0 ? (
            <Stack spacing={2}>
              {scholarships.map((item) => (
                <Paper
                  key={item._id}
                  elevation={0}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "14px",
                    border: "1px solid rgba(59, 130, 246, 0.12)",
                    background: `linear-gradient(to top, ${COLORS.cardGradientBottom} 0%, ${COLORS.cardGradientMid} 42%, ${COLORS.cardGradientTop} 100%)`,
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                      p: { xs: 2, sm: 2.5 },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {item.featured ? (
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            fontFamily: font,
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: COLORS.heading,
                            border: `1px solid ${COLORS.border}`,
                            bgcolor: "rgba(255,255,255,0.85)",
                            px: 1.25,
                            py: 0.35,
                            borderRadius: "6px",
                            mb: 1,
                          }}
                        >
                          Featured
                        </Box>
                      ) : null}
                      <Typography
                        sx={{
                          fontFamily: font,
                          fontWeight: 700,
                          fontSize: { xs: "1.125rem", md: "1.25rem" },
                          color: COLORS.heading,
                          lineHeight: 1.3,
                          mb: 0.75,
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: font,
                          fontSize: "0.875rem",
                          color: COLORS.muted,
                          mb: 1.25,
                        }}
                      >
                        Due: {formatDeadline(item.deadline)} | {item.category}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: font,
                          fontWeight: 700,
                          fontSize: { xs: "1.25rem", md: "1.5rem" },
                          color: COLORS.heading,
                        }}
                      >
                        {item.awardAmount || "—"}
                      </Typography>
                    </Box>
                    {item.link ? (
                      <Button
                        component="a"
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        endIcon={<ChevronRightIcon sx={{ fontSize: 20 }} />}
                        sx={{
                          fontFamily: font,
                          fontWeight: 600,
                          alignSelf: { xs: "stretch", sm: "center" },
                          px: 3,
                          py: 1.25,
                          borderRadius: "999px",
                          textTransform: "none",
                          fontSize: "0.9375rem",
                          bgcolor: COLORS.primary,
                          boxShadow: "none",
                          whiteSpace: "nowrap",
                          "&:hover": { bgcolor: "#2563EB", boxShadow: "none" },
                        }}
                      >
                        Apply Now
                      </Button>
                    ) : null}
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
