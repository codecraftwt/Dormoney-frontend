import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";
import { GPA_RANGE_OPTIONS, GRADE_LEVEL_OPTIONS, US_STATES } from "../constants/onboarding";
import { getToken } from "../lib/storage";
import AppButton from "../components/AppButton";
import { colors } from "../theme";

const FIELDS_OF_STUDY = [
  "Engineering","Business","Healthcare","Education","Arts & Design","Law","Social Sciences",
  "STEM","Computer Science","Undecided","Other",
];
const BACKGROUND_OPTIONS = [
  "First-generation college student","Low income / financial need","Military-connected family","Single-parent household",
  "Hispanic/Latino","African American","Asian American","Native American","Other heritage","Prefer not to say",
];
const INVOLVEMENT_OPTIONS = [
  "Sports / Athletics","Community service / Volunteering","Religious organization","Student government",
  "Arts / Music / Theater","Academic clubs","ROTC","None of the above",
];
const START_DATE_OPTIONS = ["Fall 2025", "Fall 2026", "Fall 2027", "Fall 2028", "Already enrolled", "Not sure"];
const CHALLENGE_OPTIONS = ["Finding scholarships", "Paying for college", "Writing essays", "Not sure where to start"];

const stepTitle = (step) => `Step ${step} of 4`;
const STEP_HEADING = {
  1: "Who are you?",
  2: "Academic profile",
  3: "Background",
  4: "Goals",
};
const STEP_SUBTEXT = {
  1: "Tell us a little about yourself so we can personalize your experience.",
  2: "These details help us match you to scholarships faster.",
  3: "Optional context can unlock more targeted opportunities.",
  4: "Set your goals so we can route you to the right next steps.",
};

const toggleArrayValue = (arr, value) =>
  arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const isMobile = useMediaQuery("(max-width:767px)");
  const [questionIndex, setQuestionIndex] = useState(0);
  const onFindMyScholarships = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await api.get("/api/scholarships/match");
      sessionStorage.setItem(
        "dormoney_prefetched_matches",
        JSON.stringify(res.data.scholarships || [])
      );
      navigate("/dashboard");
    } catch (_err) {
      // Do not block navigation if prefetch fails.
      navigate("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const [form, setForm] = useState({
    first_name: "",
    state: "",
    grade_level: "",
    gpa_range: "",
    fields_of_study: [],
    background_tags: [],
    involvement_tags: [],
    college_start: "",
    biggest_challenge: "",
  });

  useEffect(() => {
    if (done) return;
    if (!user) return;
    if (user.onboarding_complete) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setStep(Number(user.onboarding_current_step || 1));
    setForm((prev) => ({ ...prev, ...user }));
  }, [done, navigate, user]);
  useEffect(() => {
    setQuestionIndex(0);
  }, [step]);

  const accountWord = user?.account_type === "parent" ? "your child's" : "your";
  const progress = useMemo(() => (step / 4) * 100, [step]);
  const showQuestion = (idx) => !isMobile || questionIndex === idx;
  const chipSx = {
    borderRadius: "999px",
    fontWeight: 500,
    px: 0.5,
    py: 0.35,
    "&.MuiChip-filledPrimary": {
      bgcolor: colors.primary,
    },
  };
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: colors.paper,
    },
  };

  const saveProfile = async (payload, nextStep) => {
    setSaving(true);
    setError("");
    try {
      const res = await api.patch("/api/users/profile", {
        ...payload,
        onboarding_current_step: nextStep,
      });
      login({ token: getToken(), user: res.data.user });
      setStep(nextStep);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this step");
    } finally {
      setSaving(false);
    }
  };

  const completeOnboarding = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await api.patch("/api/users/profile", {
        college_start: form.college_start,
        biggest_challenge: form.biggest_challenge,
        onboarding_complete: true,
      });
      login({ token: getToken(), user: res.data.user });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete onboarding");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: { xs: 1, sm: 3 }, bgcolor: colors.pageBg }}>
        <Paper sx={{ maxWidth: 640, p: { xs: 2, sm: 4 }, borderRadius: 3, width: "100%", border: `1px solid ${colors.border}` }}>
          <Stack spacing={2.25}>
            <Typography variant="h4" fontWeight={800} color={colors.heading}>Your profile is ready!</Typography>
            <Typography color="text.secondary">
              {form.first_name ? `Nice work, ${form.first_name}. ` : ""}We saved your profile and your scholarship matches are ready.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {form.state || "State not set"} | {form.grade_level || "Grade not set"} | {form.gpa_range || "GPA not set"}
            </Typography>
            <AppButton
              variant="contained"
              onClick={onFindMyScholarships}
              disabled={saving}
              sx={{ borderRadius: 2, py: 1.2, textTransform: "none", fontWeight: 700 }}
            >
              Find My Scholarships →
            </AppButton>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: { xs: 1, sm: 3 }, bgcolor: colors.pageBg }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 760,
          p: { xs: 1.5, sm: 3.5 },
          borderRadius: 3,
          width: "100%",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography fontWeight={700} color={colors.bodyMuted}>{stepTitle(step)}</Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                mt: 1,
                height: 10,
                borderRadius: 999,
                bgcolor: colors.border,
                "& .MuiLinearProgress-bar": { borderRadius: 999, bgcolor: colors.primary },
              }}
            />
          </Box>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {step === 1 ? (
            <Stack spacing={2.25}>
              <Box>
                <Typography variant="h5" fontWeight={800} color="#0f172a">{STEP_HEADING[1]}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>{STEP_SUBTEXT[1]}</Typography>
              </Box>
              {showQuestion(0) ? (
                <TextField
                  label="First name"
                  value={form.first_name}
                  onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                  required
                  sx={inputSx}
                /> 
              ) : null}
              {showQuestion(1) ? (
                <Autocomplete
                  options={US_STATES}
                  value={form.state || null}
                  onChange={(_, value) => setForm((p) => ({ ...p, state: value || "" }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="State"
                      required
                      placeholder="Search state..."
                      sx={inputSx}
                    />
                  )}
                  autoHighlight
                  fullWidth
                />
              ) : null}
              <AppButton
                variant="contained"
                disabled={
                  saving ||
                  (isMobile
                    ? (questionIndex === 0 ? !form.first_name.trim() : !form.state)
                    : !form.first_name.trim() || !form.state)
                }
                onClick={() => {
                  if (isMobile && questionIndex === 0) {
                    setQuestionIndex(1);
                    return;
                  }
                  saveProfile({ first_name: form.first_name, state: form.state }, 2);
                }}
                sx={{ borderRadius: 2, py: 1.2, textTransform: "none", fontWeight: 700 }}
              >
                {isMobile && questionIndex === 0 ? "Next question" : "Continue"}
              </AppButton>
            </Stack>
          ) : null}

          {step === 2 ? (
            <Stack spacing={2.25}>
              <Box>
                <Typography variant="h5" fontWeight={800} color={colors.heading}>{STEP_HEADING[2]}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>{STEP_SUBTEXT[2]}</Typography>
              </Box>
              {showQuestion(0) ? (
                <TextField
                  select
                  label="Grade level"
                  value={form.grade_level}
                  onChange={(e) => setForm((p) => ({ ...p, grade_level: e.target.value }))}
                  required
                  sx={inputSx}
                >
                  {GRADE_LEVEL_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              ) : null}
              {showQuestion(1) ? (
                <Box>
                <Typography fontWeight={600} mb={1}>What is {accountWord} GPA range?</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {GPA_RANGE_OPTIONS.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      clickable
                      color={form.gpa_range === option ? "primary" : "default"}
                      onClick={() => setForm((p) => ({ ...p, gpa_range: option }))}
                      sx={chipSx}
                    />
                  ))}
                </Stack>
                </Box>
              ) : null}
              {showQuestion(2) ? (
                <Box>
                <Typography fontWeight={600} mb={1}>Field of study (select all that apply)</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {FIELDS_OF_STUDY.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      clickable
                      color={form.fields_of_study.includes(option) ? "primary" : "default"}
                      onClick={() => setForm((p) => ({ ...p, fields_of_study: toggleArrayValue(p.fields_of_study, option) }))}
                      sx={chipSx}
                    />
                  ))}
                </Stack>
                </Box>
              ) : null}
              <Stack direction="row" justifyContent="space-between">
                <AppButton sx={{ textTransform: "none", fontWeight: 700 }} onClick={() => {
                  if (isMobile && questionIndex > 0) {
                    setQuestionIndex((prev) => prev - 1);
                    return;
                  }
                  setStep(1);
                }}>Back</AppButton>
                <AppButton
                  variant="contained"
                  disabled={
                    saving ||
                    (isMobile
                      ? (questionIndex === 0
                        ? !form.grade_level
                        : questionIndex === 1
                          ? !form.gpa_range
                          : form.fields_of_study.length === 0)
                      : !form.grade_level || !form.gpa_range || form.fields_of_study.length === 0)
                  }
                  onClick={() => {
                    if (isMobile && questionIndex < 2) {
                      setQuestionIndex((prev) => prev + 1);
                      return;
                    }
                    saveProfile({
                      grade_level: form.grade_level,
                      gpa_range: form.gpa_range,
                      fields_of_study: form.fields_of_study,
                    }, 3);
                  }}
                  sx={{ borderRadius: 2, px: 2.5, textTransform: "none", fontWeight: 700 }}
                >
                  {isMobile && questionIndex < 2 ? "Next question" : "Continue"}
                </AppButton>
              </Stack>
            </Stack>
          ) : null}

          {step === 3 ? (
            <Stack spacing={2.25}>
              <Box>
                <Typography variant="h5" fontWeight={800} color={colors.heading}>{STEP_HEADING[3]}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>{STEP_SUBTEXT[3]}</Typography>
              </Box>
              {showQuestion(0) ? (
                <Box>
                <Typography fontWeight={600} mb={1}>Do any of these apply to you?</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {BACKGROUND_OPTIONS.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      clickable
                      color={form.background_tags.includes(option) ? "primary" : "default"}
                      onClick={() => setForm((p) => ({ ...p, background_tags: toggleArrayValue(p.background_tags, option) }))}
                      sx={chipSx}
                    />
                  ))}
                </Stack>
                </Box>
              ) : null}
              {showQuestion(1) ? (
                <Box>
                <Typography fontWeight={600} mb={1}>Are you involved in any of these?</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {INVOLVEMENT_OPTIONS.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      clickable
                      color={form.involvement_tags.includes(option) ? "primary" : "default"}
                      onClick={() => setForm((p) => ({ ...p, involvement_tags: toggleArrayValue(p.involvement_tags, option) }))}
                      sx={chipSx}
                    />
                  ))}
                </Stack>
                </Box>
              ) : null}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <AppButton sx={{ textTransform: "none", fontWeight: 700 }} onClick={() => {
                  if (isMobile && questionIndex > 0) {
                    setQuestionIndex(0);
                    return;
                  }
                  setStep(2);
                }}>Back</AppButton>
                <Link component="button" variant="body2" onClick={() => saveProfile({}, 4)} sx={{ fontWeight: 600 }}>
                  Skip for now
                </Link>
                <AppButton
                  variant="contained"
                  disabled={saving}
                  onClick={() => {
                    if (isMobile && questionIndex < 1) {
                      setQuestionIndex(1);
                      return;
                    }
                    saveProfile({
                      background_tags: form.background_tags,
                      involvement_tags: form.involvement_tags,
                    }, 4);
                  }}
                  sx={{ borderRadius: 2, px: 2.5, textTransform: "none", fontWeight: 700 }}
                >
                  {isMobile && questionIndex < 1 ? "Next question" : "Continue"}
                </AppButton>
              </Stack>
            </Stack>
          ) : null}

          {step === 4 ? (
            <Stack spacing={2.25}>
              <Box>
                <Typography variant="h5" fontWeight={800} color={colors.heading}>{STEP_HEADING[4]}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>{STEP_SUBTEXT[4]}</Typography>
              </Box>
              {showQuestion(0) ? (
                <TextField
                  select
                  label="College start date"
                  value={form.college_start}
                  onChange={(e) => setForm((p) => ({ ...p, college_start: e.target.value }))}
                  sx={inputSx}
                >
                  {START_DATE_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              ) : null}
              {showQuestion(1) ? (
                <TextField
                  select
                  label="What's your biggest challenge right now?"
                  value={form.biggest_challenge}
                  onChange={(e) => setForm((p) => ({ ...p, biggest_challenge: e.target.value }))}
                  sx={inputSx}
                >
                  {CHALLENGE_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              ) : null}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <AppButton sx={{ textTransform: "none", fontWeight: 700 }} onClick={() => {
                  if (isMobile && questionIndex > 0) {
                    setQuestionIndex(0);
                    return;
                  }
                  setStep(3);
                }}>Back</AppButton>
                <Link component="button" variant="body2" onClick={completeOnboarding} sx={{ fontWeight: 600 }}>
                  Skip for now
                </Link>
                <AppButton
                  variant="contained"
                  disabled={saving}
                  onClick={() => {
                    if (isMobile && questionIndex < 1) {
                      setQuestionIndex(1);
                      return;
                    }
                    completeOnboarding();
                  }}
                  sx={{ borderRadius: 2, px: 2.5, textTransform: "none", fontWeight: 700 }}
                >
                  {isMobile && questionIndex < 1 ? "Next question" : "Finish"}
                </AppButton>
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
