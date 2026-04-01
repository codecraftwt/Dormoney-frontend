import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

export default function ScholarshipCard({ scholarship }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography variant="h6" sx={{ fontSize: 18 }}>
            {scholarship.name}
          </Typography>
          {scholarship.featured ? <Chip size="small" label="Featured" /> : null}
        </Stack>
        <Typography sx={{ mt: 1 }}>
          <strong>Category:</strong> {scholarship.category}
        </Typography>
        <Typography>
          <strong>Deadline:</strong>{" "}
          {new Date(scholarship.deadline).toLocaleDateString()}
        </Typography>
        <Typography>
          <strong>Award:</strong> {scholarship.awardAmount}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          size="small"
          component="a"
          href={scholarship.link}
          target="_blank"
          rel="noreferrer"
        >
          Apply Now
        </Button>
      </CardActions>
    </Card>
  );
}
