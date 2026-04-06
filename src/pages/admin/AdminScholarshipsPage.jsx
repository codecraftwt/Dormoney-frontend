import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
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
import { adminAlertSx, adminOuterPaperSx, thSx } from "../../admin/adminStyles";
import { CATEGORIES } from "../../constants";
import AdminSectionHeader from "../../components/AdminSectionHeader";

const GRADE_LEVEL_OPTIONS = [
  { value: "high_school", label: "High school" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
];

const AWARD_FREQUENCY_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "one_time", label: "One-time" },
  { value: "renewable", label: "Renewable" },
];

const blankForm = {
  name: "",
  link: "",
  awardAmount: "",
  deadline: "",
  category: CATEGORIES[0],
  featured: false,
  isActive: true,
  description: "",
  eligibleMajors: "",
  minGpaRequired: "",
  eligibleStatesAll: true,
  eligibleStatesSpecific: "",
  specialEligibility: "",
  gradeLevels: [],
  essayRequired: false,
  citizenshipRequirement: "",
  organizationName: "",
  awardFrequency: "",
  numberOfAwards: "",
};

const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "deadline", label: "Deadline" },
  { value: "category", label: "Category" },
  { value: "award", label: "Award amount" },
];

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

function buildPayload(form) {
  const specific = String(form.eligibleStatesSpecific || "").trim();
  const eligibleStates = form.eligibleStatesAll ? "ALL" : specific || "ALL";
  const minGpa =
    form.minGpaRequired === "" || form.minGpaRequired === null || form.minGpaRequired === undefined
      ? null
      : Number(form.minGpaRequired);
  return {
    name: form.name.trim(),
    link: form.link.trim(),
    awardAmount: form.awardAmount.trim(),
    deadline: form.deadline,
    category: form.category,
    featured: form.featured,
    isActive: form.isActive,
    description: form.description.trim(),
    eligibleMajors: form.eligibleMajors.trim(),
    minGpaRequired: minGpa,
    eligibleStates,
    specialEligibility: form.specialEligibility.trim(),
    gradeLevels: form.gradeLevels,
    essayRequired: form.essayRequired,
    citizenshipRequirement: form.citizenshipRequirement.trim(),
    organizationName: form.organizationName.trim(),
    awardFrequency: form.awardFrequency,
    numberOfAwards: form.numberOfAwards.trim(),
  };
}

function itemToForm(item) {
  const states = String(item.eligibleStates || "ALL").trim();
  const allStates = /^ALL$/i.test(states);
  return {
    name: item.name ?? "",
    link: item.link ?? "",
    awardAmount: item.awardAmount ?? "",
    deadline: item.deadline ? item.deadline.slice(0, 10) : "",
    category: item.category ?? CATEGORIES[0],
    featured: Boolean(item.featured),
    isActive: Boolean(item.isActive),
    description: item.description ?? "",
    eligibleMajors: item.eligibleMajors ?? "",
    minGpaRequired: item.minGpaRequired != null && item.minGpaRequired !== "" ? String(item.minGpaRequired) : "",
    eligibleStatesAll: allStates,
    eligibleStatesSpecific: allStates ? "" : states,
    specialEligibility: item.specialEligibility ?? "",
    gradeLevels: Array.isArray(item.gradeLevels) ? [...item.gradeLevels] : [],
    essayRequired: Boolean(item.essayRequired),
    citizenshipRequirement: item.citizenshipRequirement ?? "",
    organizationName: item.organizationName ?? "",
    awardFrequency: item.awardFrequency ?? "",
    numberOfAwards: item.numberOfAwards ?? "",
  };
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
  /** { id, name } when user is confirming deletion */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/scholarships");
      setList(res.data.scholarships);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load scholarships";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = list;
    if (q) {
      rows = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          String(item.awardAmount).toLowerCase().includes(q) ||
          String(item.description || "")
            .toLowerCase()
            .includes(q) ||
          String(item.eligibleMajors || "")
            .toLowerCase()
            .includes(q)
      );
    }
    return sortList(rows, sortBy);
  }, [list, search, sortBy]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleGradeLevel = (value) => {
    setForm((prev) => {
      const has = prev.gradeLevels.includes(value);
      return {
        ...prev,
        gradeLevels: has ? prev.gradeLevels.filter((g) => g !== value) : [...prev.gradeLevels, value],
      };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = buildPayload(form);
    try {
      if (editingId) {
        await api.put(`/api/scholarships/${editingId}`, payload);
        toast.success("Scholarship updated.");
      } else {
        await api.post("/api/scholarships", payload);
        toast.success("Scholarship created.");
      }
      setForm(blankForm);
      setEditingId(null);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Save failed";
      const errs = err.response?.data?.errors;
      const full = errs?.length ? `${msg} (${errs.join("; ")})` : msg;
      setError(full);
      toast.error(full);
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setError("");
    setIsModalOpen(true);
    setForm(itemToForm(item));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setError("");
    setForm(blankForm);
    setIsModalOpen(true);
  };

  const confirmDeleteScholarship = async () => {
    if (!deleteTarget?.id) return;
    setError("");
    setDeleteSubmitting(true);
    try {
      await api.delete(`/api/scholarships/${deleteTarget.id}`);
      toast.success("Scholarship deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const onToggle = async (id) => {
    setError("");
    try {
      await api.patch(`/api/scholarships/${id}/toggle-active`);
      toast.success("Scholarship status updated.");
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Toggle failed";
      setError(msg);
      toast.error(msg);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  return (
    <Box>
      <AdminSectionHeader
        title="Scholarships"
        subtitle="Only name, amount, deadline, apply URL, and description are required. Other fields improve AI matching when filled in."
      />

      <Paper elevation={0} sx={adminOuterPaperSx}>
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
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
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

        {error && !isModalOpen ? <Alert severity="error" sx={adminAlertSx}>{error}</Alert> : null}

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
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography fontWeight={600} fontSize="0.875rem" noWrap>
                        {item.name}
                      </Typography>
                    </TableCell>

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

                    <TableCell sx={{ py: 1.5 }}>
                      <Typography fontSize="0.8rem" color="text.secondary" noWrap>
                        {new Date(item.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.5 }}>
                      <Typography fontSize="0.85rem" fontWeight={500} noWrap>
                        {item.awardAmount}
                      </Typography>
                    </TableCell>

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
                        <Typography fontSize="0.8rem" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>

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

                    <TableCell sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                        <Tooltip title="Edit" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onEdit(item)}
                            sx={{
                              width: 30,
                              height: 30,
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
                              width: 30,
                              height: 30,
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
                            onClick={() => setDeleteTarget({ id: item._id, name: item.name || "this scholarship" })}
                            sx={{
                              width: 30,
                              height: 30,
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

        {!loading && filteredSorted.length > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: "block" }}>
            Showing {filteredSorted.length} of {list.length} scholarships
          </Typography>
        )}
      </Paper>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteSubmitting) setDeleteTarget(null);
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
        aria-labelledby="delete-scholarship-dialog-title"
      >
        <DialogTitle id="delete-scholarship-dialog-title" sx={{ fontWeight: 700, pb: 0.5 }}>
          Delete scholarship?
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <DialogContentText sx={{ color: "text.secondary", fontSize: "0.9375rem", lineHeight: 1.6 }}>
            This will permanently remove{" "}
            <Box component="strong" sx={{ color: "text.primary", fontWeight: 700 }}>
              {deleteTarget?.name}
            </Box>{" "}
            from the database. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleteSubmitting}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteScholarship}
            color="error"
            variant="contained"
            disabled={deleteSubmitting}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 2.5 }}
          >
            {deleteSubmitting ? <CircularProgress size={22} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        fullWidth
        maxWidth="md"
        scroll="paper"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingId ? "Edit Scholarship" : "Add Scholarship"}
        </DialogTitle>
        <Box component="form" onSubmit={onSubmit}>
          <DialogContent
            dividers
            sx={{
              pt: 1,
              maxHeight: { xs: "70vh", sm: "calc(100vh - 220px)" },
            }}
          >
            <Stack spacing={2.5}>
              <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: "0.08em" }}>
                Required
              </Typography>
              <TextField
                name="name"
                value={form.name}
                onChange={onChange}
                label="Scholarship name"
                required
                fullWidth
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="link"
                value={form.link}
                onChange={onChange}
                label="Apply URL"
                required
                fullWidth
                size="small"
                helperText="Direct link to the application"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="awardAmount"
                value={form.awardAmount}
                onChange={onChange}
                label="Award amount"
                helperText='Dollar value, e.g. "$5,000" or "Amount varies"'
                required
                fullWidth
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={onChange}
                label="Deadline"
                required
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="description"
                value={form.description}
                onChange={onChange}
                label="Brief description"
                required
                fullWidth
                multiline
                minRows={3}
                size="small"
                helperText="1–2 sentences for listings and search"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <Divider sx={{ my: 0.5 }} />
              <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: "0.08em" }}>
                Optional — AI matching
              </Typography>

              <TextField
                name="eligibleMajors"
                value={form.eligibleMajors}
                onChange={onChange}
                label="Eligible majors"
                fullWidth
                size="small"
                helperText="Comma-separated (optional). E.g. Computer Science, Engineering."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="minGpaRequired"
                value={form.minGpaRequired}
                onChange={onChange}
                label="Minimum GPA required"
                type="number"
                fullWidth
                size="small"
                inputProps={{ min: 0, max: 5, step: 0.01 }}
                helperText="Optional. Scale 0–5. Leave blank if not specified."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <FormControl component="fieldset" variant="standard" sx={{ width: "100%" }}>
                <FormLabel component="legend" sx={{ fontSize: "0.75rem", fontWeight: 600, mb: 0.5 }}>
                  State eligibility (optional)
                </FormLabel>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.eligibleStatesAll}
                      onChange={(e) => setForm((prev) => ({ ...prev, eligibleStatesAll: e.target.checked }))}
                      name="eligibleStatesAll"
                      size="small"
                    />
                  }
                  label={<Typography fontSize="0.875rem">All US states</Typography>}
                />
                {!form.eligibleStatesAll ? (
                  <TextField
                    name="eligibleStatesSpecific"
                    value={form.eligibleStatesSpecific}
                    onChange={onChange}
                    label="Eligible states"
                    fullWidth
                    size="small"
                    placeholder="e.g. CA, TX, NY"
                    helperText="Comma-separated 2-letter codes. Leave blank to treat as all states."
                    sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                ) : null}
              </FormControl>

              <TextField
                name="specialEligibility"
                value={form.specialEligibility}
                onChange={onChange}
                label="Special eligibility"
                fullWidth
                multiline
                minRows={2}
                size="small"
                helperText="Optional. E.g. first-generation, low-income."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <FormControl component="fieldset" variant="standard" sx={{ width: "100%" }}>
                <FormLabel component="legend" sx={{ fontSize: "0.75rem", fontWeight: 600, mb: 0.5 }}>
                  Grade level (optional)
                </FormLabel>
                <FormGroup row sx={{ flexWrap: "wrap", gap: 0.5 }}>
                  {GRADE_LEVEL_OPTIONS.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      control={
                        <Checkbox
                          size="small"
                          checked={form.gradeLevels.includes(opt.value)}
                          onChange={() => toggleGradeLevel(opt.value)}
                        />
                      }
                      label={<Typography fontSize="0.875rem">{opt.label}</Typography>}
                    />
                  ))}
                </FormGroup>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.essayRequired}
                    onChange={onChange}
                    name="essayRequired"
                    size="small"
                  />
                }
                label={<Typography fontSize="0.875rem">Essay required</Typography>}
              />

              <TextField
                name="citizenshipRequirement"
                value={form.citizenshipRequirement}
                onChange={onChange}
                label="Citizenship requirement"
                fullWidth
                size="small"
                helperText='Optional. E.g. "US citizen", "Any".'
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <Divider sx={{ my: 0.5 }} />
              <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: "0.08em" }}>
                Optional — details
              </Typography>
              <TextField
                select
                name="category"
                value={form.category}
                onChange={onChange}
                label="Category"
                fullWidth
                size="small"
                helperText="Defaults to General on save if unset."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="organizationName"
                value={form.organizationName}
                onChange={onChange}
                label="Organization offering scholarship"
                fullWidth
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                select
                name="awardFrequency"
                value={form.awardFrequency}
                onChange={onChange}
                label="Award frequency"
                fullWidth
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                {AWARD_FREQUENCY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.label} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="numberOfAwards"
                value={form.numberOfAwards}
                onChange={onChange}
                label="Number of awards"
                fullWidth
                size="small"
                helperText='e.g. "10" or "Varies"'
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <Divider sx={{ my: 0.5 }} />
              <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: "0.08em" }}>
                Admin
              </Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <FormControlLabel
                  control={<Switch checked={form.featured} onChange={onChange} name="featured" size="small" />}
                  label={<Typography fontSize="0.875rem">Featured</Typography>}
                />
                <FormControlLabel
                  control={<Switch checked={form.isActive} onChange={onChange} name="isActive" size="small" />}
                  label={<Typography fontSize="0.875rem">Active</Typography>}
                />
              </Stack>

              {error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
            <Button onClick={closeModal} sx={{ textTransform: "none", borderRadius: 2 }}>
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
