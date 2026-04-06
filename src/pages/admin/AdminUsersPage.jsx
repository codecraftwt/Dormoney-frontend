import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api from "../../lib/api";
import {
  adminAlertSx,
  adminContainedPrimarySx,
  adminOutlinedInputSx,
  adminOuterPaperSx,
  adminTableContainerSx,
  adminTableRowHoverSx,
  thSx,
} from "../../admin/adminStyles";
import AdminSectionHeader from "../../components/AdminSectionHeader";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/users", {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
        },
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    load();
  }, [load]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const onRoleChange = async (userId, nextRole) => {
    setSavingId(userId);
    setError("");
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
        title="Users / Members"
        subtitle="Every signup is saved in the database and listed here (email, phone, date created). Promote accounts to administrator when needed."
      />

      <Paper elevation={0} sx={adminOuterPaperSx}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box component="form" onSubmit={onSearchSubmit} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
              <TextField
                size="small"
                placeholder="Search email or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ flex: 1, maxWidth: { md: 420 }, ...adminOutlinedInputSx }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" sx={{ ...adminContainedPrimarySx, flexShrink: 0 }}>
                Search
              </Button>
            </Stack>
          </Box>
        </Stack>

        {error ? <Alert severity="error" sx={adminAlertSx}>{error}</Alert> : null}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <>
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
                    <TableCell sx={thSx}>Role</TableCell>
                    <TableCell sx={thSx}>Date created</TableCell>
                    <TableCell sx={{ ...thSx, minWidth: 160 }}>Change role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography color="text.secondary" fontSize="0.9rem" sx={{ py: 4, textAlign: "center" }}>
                          {search ? "No members match your search." : "No registered users yet."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={String(u._id)} hover sx={adminTableRowHoverSx}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography fontWeight={600} fontSize="0.875rem" noWrap>
                            {u.email || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>{u.phone?.trim() ? u.phone : "—"}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            size="small"
                            label={u.role === "admin" ? "Admin" : "Member"}
                            color={u.role === "admin" ? "warning" : "default"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography fontSize="0.8rem" color="text.secondary">
                            {formatDateCreated(u.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, minWidth: 160 }}>
                          <FormControl size="small" fullWidth disabled={savingId === u._id}>
                            <InputLabel id={`role-${u._id}`}>Role</InputLabel>
                            <Select
                              labelId={`role-${u._id}`}
                              label="Role"
                              value={u.role}
                              onChange={(e) => onRoleChange(u._id, e.target.value)}
                              sx={adminOutlinedInputSx}
                            >
                              <MenuItem value="user">Member</MenuItem>
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
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ borderTop: "1px solid", borderColor: "divider", mt: 0 }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
