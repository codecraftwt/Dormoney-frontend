import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import api from "../../lib/api";
import {
  adminAlertSx,
  adminContainedPrimarySx,
  adminOuterPaperSx,
  adminOutlinedInputSx,
  adminSectionLabelSx,
  adminTableContainerSx,
  adminTableRowHoverSx,
  thSx,
} from "../../admin/adminStyles";
import AdminSectionHeader from "../../components/AdminSectionHeader";
import AppButton from "../../components/AppButton";

function formatDateCreated(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const emptyForm = { email: "", password: "", phone: "", role: "admin" };

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/users", {
        params: { role: "admin", limit: 100, page: 1 },
      });
      setAdmins(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load administrators");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeAddModal = () => {
    setAddModalOpen(false);
    setForm(emptyForm);
    setCreateError("");
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onRoleSelectChange = (e) => {
    setForm((prev) => ({ ...prev, role: e.target.value }));
  };

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const createdRole = form.role;
      await api.post("/api/admin/users", {
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role: createdRole,
      });
      closeAddModal();
      if (createdRole === "admin") {
        setSuccess("Administrator account created.");
      } else {
        setSuccess(
          "Standard user created. They can sign in at the member login. You can manage them under Users / Members."
        );
      }
      await load();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Could not create account");
    } finally {
      setSubmitting(false);
    }
  };

  const onRoleChange = async (userId, nextRole) => {
    setSavingId(userId);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: nextRole });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update role");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Box>
      <AdminSectionHeader
        title="Admin Management"
        subtitle="Create accounts and assign administrator or standard user access. The admin panel and its APIs are available only to signed-in administrators."
      />

      <Paper elevation={0} sx={adminOuterPaperSx}>
        {error ? <Alert severity="error" sx={adminAlertSx}>{error}</Alert> : null}
        {success ? (
          <Alert severity="success" sx={adminAlertSx} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        ) : null}

        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Access control: member accounts use <strong>/login</strong>; administrators use <strong>/admin/login</strong>.
            Only users with the administrator role can open this panel or call <code>/api/admin</code> routes. Demoting an
            admin to standard user is blocked if they are the last administrator.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography sx={{ ...adminSectionLabelSx, mb: 0 }}>Administrator accounts</Typography>
          <AppButton
            variant="contained"
            startIcon={<PersonAddAlt1RoundedIcon />}
            onClick={() => {
              setCreateError("");
              setForm(emptyForm);
              setAddModalOpen(true);
            }}
            sx={{ ...adminContainedPrimarySx, alignSelf: { xs: "stretch", sm: "center" } }}
          >
            Add user
          </AppButton>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <TableContainer sx={adminTableContainerSx}>
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                "& .MuiTableCell-root": { px: 2 },
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={thSx}>Email</TableCell>
                  <TableCell sx={thSx}>Phone</TableCell>
                  <TableCell sx={thSx}>Status</TableCell>
                  <TableCell sx={thSx}>Date created</TableCell>
                  <TableCell sx={{ ...thSx, minWidth: 160 }}>Role / access</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary" fontSize="0.9rem" sx={{ py: 4, textAlign: "center" }}>
                        No administrator accounts yet. Use Add user to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((u) => (
                    <TableRow key={String(u._id)} hover sx={adminTableRowHoverSx}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography fontWeight={600} fontSize="0.875rem" noWrap>
                          {u.email || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>{u.phone?.trim() ? u.phone : "—"}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip size="small" label="Administrator" color="warning" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography fontSize="0.8rem" color="text.secondary">
                          {formatDateCreated(u.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, minWidth: 160 }}>
                        <FormControl size="small" fullWidth disabled={savingId === u._id}>
                          <InputLabel id={`adm-${u._id}`}>Role</InputLabel>
                          <Select
                            labelId={`adm-${u._id}`}
                            label="Role"
                            value={u.role}
                            onChange={(e) => onRoleChange(u._id, e.target.value)}
                            sx={adminOutlinedInputSx}
                          >
                            <MenuItem value="user">Standard user</MenuItem>
                            <MenuItem value="admin">Administrator</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={addModalOpen}
        onClose={(_e, reason) => {
          if (submitting && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
          closeAddModal();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add user</DialogTitle>
        <Box component="form" onSubmit={onCreateSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                size="small"
                name="email"
                label="Email"
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={onFormChange}
                sx={adminOutlinedInputSx}
              />
              <TextField
                required
                fullWidth
                size="small"
                name="phone"
                label="Phone"
                autoComplete="off"
                value={form.phone}
                onChange={onFormChange}
                sx={adminOutlinedInputSx}
              />
              <TextField
                required
                fullWidth
                size="small"
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={onFormChange}
                helperText="At least 6 characters"
                sx={adminOutlinedInputSx}
              />
              <FormControl fullWidth size="small">
                <InputLabel id="new-user-role">Role / access</InputLabel>
                <Select
                  labelId="new-user-role"
                  label="Role / access"
                  name="role"
                  value={form.role}
                  onChange={onRoleSelectChange}
                  sx={adminOutlinedInputSx}
                >
                  <MenuItem value="admin">Administrator (full admin panel)</MenuItem>
                  <MenuItem value="user">Standard user (member app only)</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                Standard users are listed under{" "}
                <Link component={RouterLink} to="/admin/users" fontWeight={600} onClick={closeAddModal}>
                  Users / Members
                </Link>
                .
              </Typography>
              {createError ? <Alert severity="error" sx={{ borderRadius: 2 }}>{createError}</Alert> : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
            <AppButton onClick={closeAddModal} sx={{ textTransform: "none", borderRadius: 2 }}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 3 }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : "Create account"}
            </AppButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}