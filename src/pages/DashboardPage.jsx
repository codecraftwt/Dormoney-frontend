import { useEffect, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import api from "../lib/api";
import { AMOUNT_RANGES, CATEGORIES } from "../constants";
import useAuth from "../hooks/useAuth";

const initialFilters = {
  categories: [],
  amountRanges: [],
  deadlineStart: "",
  deadlineEnd: "",
};

const blankForm = {
  name: "",
  link: "",
  awardAmount: "",
  deadline: "",
  category: CATEGORIES[0],
  featured: false,
  isActive: true,
};

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    action: null,
  });

  const fetchScholarships = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (!isAdmin) {
        params.activeOnly = true;
      }
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
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
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

  const onClearSearch = () => {
    setSearchText("");
    setFilters(initialFilters);
    fetchScholarships(initialFilters);
  };

  const onFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(blankForm);
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      link: item.link || "",
      awardAmount: item.awardAmount || "",
      deadline: item.deadline ? item.deadline.slice(0, 10) : "",
      category: item.category || CATEGORIES[0],
      featured: Boolean(item.featured),
      isActive: Boolean(item.isActive),
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/api/scholarships/${editingId}`, form);
        toast.success("Scholarship updated successfully");
      } else {
        await api.post("/api/scholarships", form);
        toast.success("Scholarship created successfully");
      }
      setForm(blankForm);
      setEditingId(null);
      setIsModalOpen(false);
      fetchScholarships();
    } catch (err) {
      const message = err.response?.data?.message || "Save failed";
      setError(message);
      toast.error(message);
    }
  };

  const onToggle = async (id) => {
    setError("");
    try {
      await api.patch(`/api/scholarships/${id}/toggle-active`);
      toast.success("Scholarship status updated");
      fetchScholarships();
    } catch (err) {
      const message = err.response?.data?.message || "Toggle failed";
      setError(message);
      toast.error(message);
    }
  };

  const onStatusChange = async (item, nextStatus) => {
    const wantsActive = nextStatus === "active";
    const isCurrentlyActive = Boolean(item.isActive);
    if (wantsActive === isCurrentlyActive) return;
    setConfirmDialog({
      open: true,
      title: "Change scholarship status",
      message: `Do you want to mark "${item.name}" as ${
        wantsActive ? "Active" : "Inactive"
      }?`,
      confirmText: "Yes, update",
      action: {
        type: "status",
        id: item._id,
      },
    });
  };

  const onDelete = (id, name = "this scholarship") => {
    setConfirmDialog({
      open: true,
      title: "Delete scholarship",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Yes, delete",
      action: {
        type: "delete",
        id,
      },
    });
  };

  const runDelete = async (id) => {
    setError("");
    try {
      await api.delete(`/api/scholarships/${id}`);
      toast.success("Scholarship deleted successfully");
      fetchScholarships();
    } catch (err) {
      const message = err.response?.data?.message || "Delete failed";
      setError(message);
      toast.error(message);
    }
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false, action: null }));
  };

  const handleConfirmAction = async () => {
    const action = confirmDialog.action;
    handleConfirmDialogClose();
    if (!action) return;

    if (action.type === "delete") {
      await runDelete(action.id);
      return;
    }

    if (action.type === "status") {
      await onToggle(action.id);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        bgcolor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          alignItems: "start",
        }}
      >
        <Box>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              position: { md: "sticky" },
              top: 12,
              border: "1px solid #dfe5ef",
              boxShadow: "none",
              bgcolor: "#f1f4f9",
            }}
          >
            <Typography variant="h6" fontWeight={800} color="primary" sx={{ lineHeight: 1.1 }}>
              Dormoney
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Scholarship Dashboard
            </Typography>

            <Typography variant="subtitle1" fontWeight={700}>
              Filters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Narrow down scholarship results
            </Typography>
            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff", border: "1px solid #e4e9f2", mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Category
              </Typography>
              <Stack>
                {CATEGORIES.map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleArrayValue("categories", category)}
                      />
                    }
                    label={category}
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff", border: "1px solid #e4e9f2", mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Deadline Range
              </Typography>
              <Stack spacing={1}>
                <TextField
                  size="small"
                  type="date"
                  label="From"
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
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
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
                />
              </Stack>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff", border: "1px solid #e4e9f2", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Award Amount
              </Typography>
              <Stack>
                {AMOUNT_RANGES.map((range) => (
                  <FormControlLabel
                    key={range.value}
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.amountRanges.includes(range.value)}
                        onChange={() => toggleArrayValue("amountRanges", range.value)}
                      />
                    }
                    label={range.label}
                  />
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" onClick={() => fetchScholarships()}>
                Apply
              </Button>
              <Button fullWidth variant="outlined" onClick={onResetFilters}>
                Reset
              </Button>
            </Stack>
          </Paper>
        </Box>

        <Box>
          <Paper
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 3,
              mb: 2,
              border: "1px solid",
              borderColor: "#e7ebf3",
              boxShadow: "none",
              bgcolor: "#fff",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "start", sm: "center" }}
              spacing={1}
            >
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                  Dashboard
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: 26, md: 34 } }}>
                  Welcome back, {user?.email?.split("@")[0] || "User"}
                </Typography>
                <Typography color="text.secondary">{user?.email}</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Logout">
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={logout}
                    aria-label="Logout"
                    startIcon={<LogoutIcon fontSize="small" />}
                    sx={{
                      minWidth: { xs: 40, sm: 110 },
                      px: { xs: 1.25, sm: 1.75 },
                    }}
                  >
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Logout
                    </Box>
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>

            <Box component="form" onSubmit={onAiSearch} sx={{ mt: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="AI search (e.g. Scholarships for business majors under $5,000)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    endAdornment: searchText ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label="Clear search"
                          onClick={onClearSearch}
                          edge="end"
                        >
                          <RestartAltIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AutoAwesomeIcon />}
                  disabled={loading || !searchText.trim()}
                  sx={{ minWidth: 140 }}
                >
                  AI Search
                </Button>
              </Stack>
            </Box>
          </Paper>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Stack>
          ) : null}

          {!loading && scholarships.length === 0 ? (
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: "#e7ebf3",
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ py: 5 }}>
                <Stack spacing={1.25} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: "#f1f4f9",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <SearchOffIcon color="action" />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    No results found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We could not find scholarships matching your current search or filters.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={onResetFilters}
                  >
                    Clear filters
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {!loading && scholarships.length > 0 ? (
            <Paper
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "#e7ebf3",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
                bgcolor: "#fff",
              }}
            >
              {isAdmin ? (
                <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" onClick={openCreateModal}>
                      Add Scholarship
                    </Button>
                  </Stack>
                </Box>
              ) : null}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Deadline</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Award</TableCell>
                      {isAdmin ? <TableCell sx={{ fontWeight: 700 }}>Featured</TableCell> : null}
                      {isAdmin ? <TableCell sx={{ fontWeight: 700 }}>Status</TableCell> : null}
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scholarships.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          {item.deadline
                            ? new Date(item.deadline).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{item.awardAmount || "-"}</TableCell>
                        {isAdmin ? (
                          <TableCell>
                            {item.featured ? <Chip size="small" label="Yes" /> : "No"}
                          </TableCell>
                        ) : null}
                        {isAdmin ? (
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={item.isActive ? "active" : "inactive"}
                              onChange={(e) => onStatusChange(item, e.target.value)}
                              sx={{ minWidth: 130 }}
                            >
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                            </TextField>
                          </TableCell>
                        ) : null}
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {item.link && !isAdmin ? (
                              <Button
                                size="small"
                                variant="contained"
                                component="a"
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textTransform: "none", fontWeight: 600 }}
                              >
                                Apply Here
                              </Button>
                            ) : null}
                            {item.link && isAdmin ? (
                              <Tooltip title="View">
                                <IconButton
                                  size="small"
                                  color="tertiary"
                                  component="a"
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <VisibilityRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {isAdmin ? (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onEdit(item)}
                                >
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {isAdmin ? (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => onDelete(item._id, item.name)}
                                 
                                >
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : null}

        </Box>
      </Box>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingId ? "Edit Scholarship" : "Add Scholarship"}</DialogTitle>
        <Box component="form" onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                name="name"
                value={form.name}
                onChange={onFormChange}
                label="Name"
                required
              />
              <TextField
                name="link"
                value={form.link}
                onChange={onFormChange}
                label="External URL"
                required
              />
              <TextField
                name="awardAmount"
                value={form.awardAmount}
                onChange={onFormChange}
                label="Award Amount"
                helperText='e.g. "$5,000" or "Amount varies"'
                required
              />
              <TextField
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={onFormChange}
                required
              />
              <TextField
                select
                name="category"
                value={form.category}
                onChange={onFormChange}
                label="Category"
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.featured}
                    onChange={onFormChange}
                    name="featured"
                  />
                }
                label="Featured"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={onFormChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Update Scholarship" : "Create Scholarship"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={handleConfirmDialogClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmAction}>
            {confirmDialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
