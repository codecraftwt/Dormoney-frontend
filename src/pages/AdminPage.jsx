import { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import api from "../lib/api";
import { CATEGORIES } from "../constants";
import useAuth from "../hooks/useAuth";

const blankForm = {
  name: "",
  link: "",
  awardAmount: "",
  deadline: "",
  category: CATEGORIES[0],
  featured: false,
  isActive: true,
};

export default function AdminPage({ embedded = false, showLogout = true }) {
  const { logout } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    loadData();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    <Box
      sx={
        embedded
          ? undefined
          : { p: { xs: 2, md: 3 }, bgcolor: "#f3f6fb", minHeight: "100vh" }
      }
    >
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant={embedded ? "h6" : "h5"} fontWeight={700}>
              Admin Panel
            </Typography>
            <Typography color="text.secondary">
              Manage scholarship records
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={openCreateModal}>
              Add Scholarship
            </Button>
            {showLogout ? (
              <Button variant="outlined" color="inherit" onClick={logout}>
                Logout
              </Button>
            ) : null}
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {loading ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CircularProgress />
          </Stack>
        ) : null}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Award</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{new Date(item.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{item.awardAmount}</TableCell>
                  <TableCell>
                    {item.featured ? <Chip size="small" label="Yes" /> : "No"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={item.isActive ? "success" : "default"}
                      label={item.isActive ? "Active" : "Inactive"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => onEdit(item)}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => onToggle(item._id)}>
                        Toggle
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => onDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
                onChange={onChange}
                label="Name"
                required
              />
              <TextField
                name="link"
                value={form.link}
                onChange={onChange}
                label="External URL"
                required
              />
              <TextField
                name="awardAmount"
                value={form.awardAmount}
                onChange={onChange}
                label="Award Amount"
                helperText='e.g. "$5,000" or "Amount varies"'
                required
              />
              <TextField
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={onChange}
                required
              />
              <TextField
                select
                name="category"
                value={form.category}
                onChange={onChange}
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
                    onChange={onChange}
                    name="featured"
                  />
                }
                label="Featured"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={onChange}
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
    </Box>
  );
}
