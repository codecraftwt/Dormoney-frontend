/** Shared layout + table styling for admin panel (matches AdminScholarshipsPage). */

export const adminOuterPaperSx = {
  p: { xs: 2, md: 3 },
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
};

export const thSx = {
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

export const adminAlertSx = { mb: 2, borderRadius: 2 };

export const adminSectionLabelSx = {
  mb: 1.5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontWeight: 600,
  fontSize: "0.75rem",
  color: "text.secondary",
};

export const adminToolbarButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
};

export const adminContainedPrimarySx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  px: 3,
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
};

export const adminOutlinedInputSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
};

export const adminTableContainerSx = {
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
};

export const adminTableRowHoverSx = {
  "&:last-child td": { border: 0 },
  "&:hover": { bgcolor: "grey.50" },
  transition: "background 0.15s",
};
