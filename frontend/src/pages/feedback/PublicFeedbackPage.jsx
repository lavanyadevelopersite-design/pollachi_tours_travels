import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Rating,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalTaxiOutlinedIcon from '@mui/icons-material/LocalTaxiOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useSnackbar } from 'notistack';
import { feedbackService } from '../../services/common.service';
import { useBranding } from '../../hooks/queries/useBranding';
import { APP_NAME, GOOGLE_REVIEW_URL, resolveMediaUrl } from '../../utils/constants';

const ACCENT = '#0f766e';

function brandLogoSrc(path) {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

const RATING_FIELDS = [
  {
    key: 'transportation_rating',
    label: 'Transportation',
    hint: 'Vehicle comfort, cleanliness & ride quality',
    icon: <DirectionsCarFilledIcon sx={{ fontSize: 22, color: '#0284c7' }} />,
    iconBg: '#e0f2fe',
    filled: <DirectionsCarFilledIcon fontSize="inherit" />,
    empty: <DirectionsCarFilledOutlinedIcon fontSize="inherit" />,
    color: '#0284c7',
  },
  {
    key: 'overall_rating',
    label: 'Overall Trip Experience',
    hint: 'How was your journey overall?',
    icon: <StarRoundedIcon sx={{ fontSize: 22, color: '#d97706' }} />,
    iconBg: '#fef3c7',
    filled: <StarRoundedIcon fontSize="inherit" />,
    empty: <StarOutlineRoundedIcon fontSize="inherit" />,
    color: '#d97706',
  },
  {
    key: 'customer_support_rating',
    label: 'Customer Support',
    hint: 'Helpfulness of our support team',
    icon: <SupportAgentIcon sx={{ fontSize: 22, color: '#7c3aed' }} />,
    iconBg: '#ede9fe',
    filled: <SupportAgentIcon fontSize="inherit" />,
    empty: <HeadsetMicOutlinedIcon fontSize="inherit" />,
    color: '#7c3aed',
  },
  {
    key: 'staff_behaviour_rating',
    label: 'Staff Behaviour',
    hint: 'Driver & staff courtesy',
    icon: <FavoriteRoundedIcon sx={{ fontSize: 22, color: '#db2777' }} />,
    iconBg: '#fce7f3',
    filled: <FavoriteRoundedIcon fontSize="inherit" />,
    empty: <FavoriteBorderRoundedIcon fontSize="inherit" />,
    color: '#db2777',
  },
];

function GoogleGIcon({ size = 28 }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 48 48"
      sx={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C39.8 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </Box>
  );
}

function GoogleReviewCard({ companyName }) {
  return (
    <Box
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha('#4285F4', 0.2)}`,
        bgcolor: '#f7faff',
        boxShadow: '0 10px 24px rgba(66,133,244,0.10)',
        p: { xs: 2, sm: 2.25 },
      }}
    >
      <Stack spacing={1.75}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: '#fff',
              border: `1px solid ${alpha('#4285F4', 0.16)}`,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 6px 14px rgba(15,23,42,0.08)',
              flexShrink: 0,
            }}
          >
            <GoogleGIcon size={28} />
          </Box>
          <Box sx={{ minWidth: 0, pt: 0.15 }}>
            <Stack direction="row" spacing={0.35} sx={{ mb: 0.4 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <StarRoundedIcon key={i} sx={{ fontSize: 16, color: '#F4B400' }} />
              ))}
            </Stack>
            <Typography fontWeight={800} color="#0f172a" fontSize={16} lineHeight={1.25}>
              Share us on Google
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, lineHeight: 1.45 }}>
              A Google review helps more travellers find {companyName}.
            </Typography>
          </Box>
        </Stack>
        <Button
          component="a"
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          fullWidth
          endIcon={<OpenInNewRoundedIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 999,
            py: 1.2,
            bgcolor: '#4285F4',
            boxShadow: '0 8px 18px rgba(66,133,244,0.32)',
            '&:hover': { bgcolor: '#3367d6' },
          }}
        >
          Write a Google Review
        </Button>
      </Stack>
    </Box>
  );
}

export default function PublicFeedbackPage() {
  const { token } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { data: branding } = useBranding();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [comments, setComments] = useState('');
  const [ratings, setRatings] = useState({
    transportation_rating: 0,
    overall_rating: 0,
    customer_support_rating: 0,
    staff_behaviour_rating: 0,
  });

  const logoUrl = brandLogoSrc(branding?.company_logo);
  const showLogo = Boolean(logoUrl) && !logoFailed;
  const companyName = branding?.company_name || APP_NAME;

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await feedbackService.getPublic(token);
        if (!active) return;
        setPayload(data?.data ?? data);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || 'This feedback link is invalid or expired.');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (token) load();
    return () => {
      active = false;
    };
  }, [token]);

  const alreadySubmitted = Boolean(payload?.already_submitted);

  const submitFeedback = async () => {
    if (submitting) return;

    for (const field of RATING_FIELDS) {
      const value = Number(ratings[field.key]);
      if (!Number.isFinite(value) || value < 1) {
        enqueueSnackbar(`Please rate ${field.label}`, { variant: 'warning' });
        return;
      }
    }
    if (!comments.trim()) {
      enqueueSnackbar('Please enter a short description of your experience', { variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await feedbackService.submitPublic(token, {
        transportation_rating: Number(ratings.transportation_rating),
        overall_rating: Number(ratings.overall_rating),
        customer_support_rating: Number(ratings.customer_support_rating),
        staff_behaviour_rating: Number(ratings.staff_behaviour_rating),
        comments: comments.trim(),
        customer_name: payload?.customer_name || undefined,
      });
      setPayload(data?.data ?? data);
      enqueueSnackbar('Thank you! Your feedback has been submitted.', { variant: 'success' });
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const firstError = Array.isArray(apiErrors) && apiErrors[0]?.message;
      enqueueSnackbar(
        firstError || err?.response?.data?.message || 'Unable to submit feedback',
        { variant: 'error' }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    submitFeedback();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
        px: 2,
        background: `linear-gradient(160deg, ${alpha(ACCENT, 0.12)} 0%, #f8fafc 45%, ${alpha('#ea580c', 0.08)} 100%)`,
      }}
    >
      <Container maxWidth="sm" disableGutters>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 10 }}>
            <CircularProgress sx={{ color: ACCENT }} />
          </Stack>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        ) : (
          <Stack spacing={2.5}>
            <Box
              sx={{
                borderRadius: 3,
                bgcolor: '#fff',
                border: `1px solid ${alpha('#0f172a', 0.08)}`,
                boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 3,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #1c232f 100%)`,
                  color: '#fff',
                }}
              >
                <Box
                  sx={{
                    width: showLogo ? 72 : 56,
                    height: showLogo ? 72 : 56,
                    borderRadius: 2.5,
                    bgcolor: showLogo ? 'rgba(255,255,255,0.1)' : alpha('#14b8a6', 0.9),
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.25,
                    overflow: 'hidden',
                  }}
                >
                  {showLogo ? (
                    <Box
                      component="img"
                      src={logoUrl}
                      alt={companyName}
                      onError={() => setLogoFailed(true)}
                      sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.75 }}
                    />
                  ) : (
                    <LocalTaxiOutlinedIcon sx={{ fontSize: 28 }} />
                  )}
                </Box>
                <Typography fontWeight={800} fontSize={22} lineHeight={1.2}>
                  {companyName}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                  We value your feedback
                </Typography>
              </Box>

              <Box sx={{ px: { xs: 2.25, sm: 3 }, py: 2.25 }}>
                <GoogleReviewCard companyName={companyName} />
              </Box>
            </Box>

            {alreadySubmitted ? (
              <Box
                sx={{
                  borderRadius: 3,
                  bgcolor: '#fff',
                  border: `1px solid ${alpha('#059669', 0.25)}`,
                  p: 3,
                  textAlign: 'center',
                  boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
                }}
              >
                <CheckCircleOutlinedIcon sx={{ fontSize: 48, color: '#059669', mb: 1 }} />
                <Typography fontWeight={800} fontSize={20} color="#0f172a">
                  Feedback already submitted
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Thank you for sharing your experience with {companyName}.
                </Typography>
              </Box>
            ) : (
              <Box
                component="form"
                noValidate
                onSubmit={onSubmit}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#fff',
                  border: `1px solid ${alpha('#0f172a', 0.08)}`,
                  boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
                  p: { xs: 2.25, sm: 3 },
                }}
              >
                <Typography fontWeight={800} fontSize={17} color="#0f172a" sx={{ mb: 0.5 }}>
                  Rate your trip
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Tap the icons to rate each area out of 5
                </Typography>

                <Stack spacing={2}>
                  {RATING_FIELDS.map((field) => (
                    <Box
                      key={field.key}
                      sx={{
                        borderRadius: 2.5,
                        border: `1px solid ${alpha(field.color, 0.2)}`,
                        bgcolor: alpha(field.color, 0.04),
                        p: 1.75,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: field.iconBg,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {field.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={800} color="#0f172a">
                            {field.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {field.hint}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
                            <Rating
                              name={field.key}
                              value={Number(ratings[field.key]) || 0}
                              max={5}
                              onChange={(_, value) =>
                                setRatings((prev) => ({
                                  ...prev,
                                  [field.key]: value == null ? 0 : Number(value),
                                }))
                              }
                              icon={field.filled}
                              emptyIcon={field.empty}
                              sx={{
                                color: field.color,
                                fontSize: 30,
                                '& .MuiRating-iconFilled': { color: field.color },
                                '& .MuiRating-iconEmpty': { color: alpha(field.color, 0.35) },
                              }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight={800}
                              sx={{ color: field.color, minWidth: 42 }}
                            >
                              {ratings[field.key] || 0}/5
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Typography fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Tell us about your trip experience..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: alpha('#0f172a', 0.02),
                    },
                  }}
                />

                <Button
                  type="button"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  onClick={submitFeedback}
                  sx={{
                    mt: 2.5,
                    py: 1.35,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: 16,
                    bgcolor: ACCENT,
                    boxShadow: `0 10px 24px ${alpha(ACCENT, 0.35)}`,
                    '&:hover': { bgcolor: '#0d9488' },
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit Feedback'}
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
