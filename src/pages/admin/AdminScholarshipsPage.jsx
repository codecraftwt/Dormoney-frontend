import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import SearchIcon from "@mui/icons-material/Search";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import api from "../../lib/api";
import { CATEGORIES } from "../../constants";
import AdminSectionHeader from "../../components/AdminSectionHeader";

const blankForm = {
  name: "",
  link: "",
  awardAmount: "",
  deadline: "",
  category: CATEGORIES[0],
  featured: false,
  isActive: true,
};

const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "deadline", label: "Deadline" },
  { value: "category", label: "Category" },
  { value: "award", label: "Award amount" },
];

const thSx = {
  fontWeight: 600,
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "text.secondary",
  py: 1.5,
  borderBottom: "1px solid",
  borderColor: "divider",
  whiteSpace: "nowrap",
  overflow: "hidden",
};

function sortList(items, sortBy) {
  const copy = [...items];
  copy.sort((a, b) => {
    if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
    if (sortBy === "award") return String(a.awardAmount).localeCompare(String(b.awardAmount), undefined, { numeric: true });
    if (sortBy === "category") return String(a.category).localeCompare(String(b.category));
    return String(a.name).localeCompare(String(b.name));
  });
  return copy;
}

export default function AdminScholarshipsPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/scholarships");
      setList(res.data.scholarships);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = list;
    if (q) {
      rows = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          String(item.awardAmount).toLowerCase().includes(q)
      );
    }
    return sortList(rows, sortBy);
  }, [list, search, sortBy]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/api/scholarships/${editingId}`, form);
      } else {
        await api.post("/api/scholarships", form);
      }
      setForm(blankForm);
      setEditingId(null);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setIsModalOpen(true);
    setForm({
      name: item.name,
      link: item.link,
      awardAmount: item.awardAmount,
      deadline: item.deadline ? item.deadline.slice(0, 10) : "",
      category: item.category,
      featured: Boolean(item.featured),
      isActive: Boolean(item.isActive),
    });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(blankForm);
    setIsModalOpen(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this scholarship?")) return;
    setError("");
    try {
      await api.delete(`/api/scholarships/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const onToggle = async (id) => {
    setError("");
    try {
      await api.patch(`/api/scholarships/${id}/toggle-active`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Toggle failed");
    }
  };

  return (
    <Box>
      <AdminSectionHeader
        title="Scholarships"
        subtitle="Manage and oversee all scholarship records."
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Toolbar */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              size="small"
              placeholder="Search scholarships..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                flex: 1,
                maxWidth: { md: 380 },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                minWidth: 170,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <Button
            variant="contained"
            onClick={openCreateModal}
            sx={{
              flexShrink: 0,
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            + Add Scholarship
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        )}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <TableContainer sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                "& .MuiTableCell-root": { px: 2 },
              }}
            >
              <colgroup>
                <col style={{ width: "25%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={thSx}>Name</TableCell>
                  <TableCell sx={thSx}>Category</TableCell>
                  <TableCell sx={thSx}>Deadline</TableCell>
                  <TableCell sx={thSx}>Award</TableCell>
                  <TableCell sx={thSx}>Featured</TableCell>
                  <TableCell sx={thSx}>Status</TableCell>
                  <TableCell sx={{ ...thSx, textAlign: "center" }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredSorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="text.secondary" fontSize="0.9rem" sx={{ py: 4, textAlign: "center" }}>
                        {list.length === 0
                          ? "No scholarships yet. Click Add Scholarship to create one."
                          : "No scholarships match your search."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}

                {filteredSorted.map((item) => (
                  <TableRow
                    key={item._id}
                    hover
                    sx={{
                      "&:last-child td": { border: 0 },
                      "&:hover": { bgcolor: "grey.50" },
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Name */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography fontWeight={600} fontSize="0.875rem" noWrap>
                        {item.name}
                      </Typography>
                    </TableCell>

                    {/* Category */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{
                          bgcolor: "primary.50",
                          color: "primary.700",
                          fontWeight: 500,
                          fontSize: "0.72rem",
                          height: 22,
                          border: "none",
                          maxWidth: "100%",
                        }}
                      />
                    </TableCell>

                    {/* Deadline */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography fontSize="0.8rem" color="text.secondary" noWrap>
                        {new Date(item.deadline).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </Typography>
                    </TableCell>

                    {/* Award */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography fontSize="0.85rem" fontWeight={500} noWrap>
                        {item.awardAmount}
                      </Typography>
                    </TableCell>

                    {/* Featured */}
                    <TableCell sx={{ py: 1.5 }}>
                      {item.featured ? (
                        <Chip
                          icon={<StarRoundedIcon sx={{ fontSize: "13px !important", color: "#b45309 !important" }} />}
                          label="Featured"
                          size="small"
                          sx={{
                            bgcolor: "#fef3c7",
                            color: "#b45309",
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            height: 22,
                            border: "1px solid #fde68a",
                            "& .MuiChip-icon": { ml: "5px" },
                          }}
                        />
                      ) : (
                        <Typography fontSize="0.8rem" color="text.disabled">—</Typography>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        size="small"
                        label={item.isActive ? "Active" : "Inactive"}
                        sx={{
                          height: 22,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          bgcolor: item.isActive ? "#dcfce7" : "#f1f5f9",
                          color: item.isActive ? "#15803d" : "#64748b",
                          border: `1px solid ${item.isActive ? "#bbf7d0" : "#e2e8f0"}`,
                        }}
                      />
                    </TableCell>

                    {/* Actions — icon-only buttons keep the column narrow */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                        <Tooltip title="Edit" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onEdit(item)}
                            sx={{
                              width: 30, height: 30,
                              borderRadius: 1.5,
                              border: "1px solid",
                              borderColor: "grey.300",
                              color: "text.secondary",
                              "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: "primary.50" },
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={item.isActive ? "Deactivate" : "Activate"} placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onToggle(item._id)}
                            sx={{
                              width: 30, height: 30,
                              borderRadius: 1.5,
                              border: "1px solid",
                              borderColor: item.isActive ? "#fde68a" : "#bbf7d0",
                              color: item.isActive ? "#b45309" : "#15803d",
                              bgcolor: item.isActive ? "#fefce8" : "#f0fdf4",
                              "&:hover": {
                                borderColor: item.isActive ? "#f59e0b" : "#22c55e",
                                bgcolor: item.isActive ? "#fef3c7" : "#dcfce7",
                              },
                            }}
                          >
                            <PowerSettingsNewRoundedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(item._id)}
                            sx={{
                              width: 30, height: 30,
                              borderRadius: 1.5,
                              border: "1px solid",
                              borderColor: "#fecaca",
                              color: "#dc2626",
                              bgcolor: "#fff5f5",
                              "&:hover": { borderColor: "#f87171", bgcolor: "#fee2e2" },
                            }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Row count */}
        {!loading && filteredSorted.length > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: "block" }}>
            Showing {filteredSorted.length} of {list.length} scholarships
          </Typography>
        )}
      </Paper>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingId ? "Edit Scholarship" : "Add Scholarship"}
        </DialogTitle>
        <Box component="form" onSubmit={onSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              <TextField
                name="name" value={form.name} onChange={onChange}
                label="Name" required fullWidth size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="link" value={form.link} onChange={onChange}
                label="External URL" required fullWidth size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="awardAmount" value={form.awardAmount} onChange={onChange}
                label="Award Amount" helperText='e.g. "$5,000" or "Amount varies"'
                required fullWidth size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="deadline" type="date" value={form.deadline} onChange={onChange}
                label="Deadline" required fullWidth size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                select name="category" value={form.category} onChange={onChange}
                label="Category" fullWidth size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={3}>
                <FormControlLabel
                  control={<Switch checked={form.featured} onChange={onChange} name="featured" size="small" />}
                  label={<Typography fontSize="0.875rem">Featured</Typography>}
                />
                <FormControlLabel
                  control={<Switch checked={form.isActive} onChange={onChange} name="isActive" size="small" />}
                  label={<Typography fontSize="0.875rem">Active</Typography>}
                />
              </Stack>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
            <Button onClick={() => setIsModalOpen(false)} sx={{ textTransform: "none", borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 3 }}>
              {editingId ? "Update Scholarship" : "Create Scholarship"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}