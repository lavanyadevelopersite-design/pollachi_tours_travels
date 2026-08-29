import { Box, Button, Chip, Stack, Typography, alpha } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { ITINERARY_THEMES, THEME_COVER_IMAGES, getItineraryThemeId } from '../../utils/itineraryThemes';
import ThemeAnimRoot from './ThemeAnimRoot';

function ThemeCard({ theme, selected, onSelect, disabled, delay = 0 }) {
  const cover = theme.id === 'scenic_escape' ? THEME_COVER_IMAGES[1] : THEME_COVER_IMAGES[0];
  return (
    <Box
      className="theme-picker-card"
      data-theme-anim
      style={{ animationDelay: `${delay}s` }}
      onClick={() => !disabled && onSelect(theme.id)}
      sx={{
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: 3,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: selected ? theme.accent : alpha('#152238', 0.1),
        bgcolor: '#fff',
        boxShadow: selected
          ? `0 16px 36px ${alpha(theme.accent, 0.22)}`
          : '0 10px 24px rgba(21,34,56,0.06)',
        transform: selected ? 'translateY(-2px)' : 'none',
        transition: 'all .18s ease',
        '&:hover': disabled
          ? undefined
          : {
              borderColor: theme.accent,
              transform: 'translateY(-6px) scale(1.01)',
              boxShadow: `0 18px 36px ${alpha(theme.accent, 0.22)}`,
            },
      }}
    >
      <Box
        sx={{
          height: 148,
          p: 0,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: theme.paper,
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35)), url(${cover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 12,
            bottom: 10,
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,0.45)',
          }}
        >
          <Typography sx={{ fontFamily: '"Great Vibes", cursive', fontSize: 22, lineHeight: 1 }}>
            {theme.id === 'scenic_escape' ? 'Travel Beyond Dreams' : 'Explore the world'}
          </Typography>
        </Box>
        {selected && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
            label="Selected"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: theme.accent,
              color: '#fff',
              fontWeight: 800,
            }}
          />
        )}
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography fontWeight={800} color={theme.heading}>
          {theme.name}
        </Typography>
        <Typography variant="caption" fontWeight={700} color={theme.accent} display="block" sx={{ mb: 0.75 }}>
          {theme.tagline}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {theme.description}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ItineraryThemeTab({
  data,
  canEdit,
  saving,
  onSaveTheme,
  onOpenPreview,
}) {
  const savedId = getItineraryThemeId(data);
  const selectedId = data?.__themeDraft || savedId;

  return (
    <ThemeAnimRoot>
      <Box
        data-theme-anim
        sx={{
          mb: 2.5,
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 10px 28px rgba(21,34,56,0.06)',
        }}
      >
        <Typography variant="h5" fontWeight={800} color="#152238">
          Choose a customer theme
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
          Pick one look for the full preview link you share with the customer. The planner stays the same —
          only <strong>/itineraries/preview</strong> uses this theme.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {ITINERARY_THEMES.map((theme, index) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            selected={selectedId === theme.id}
            disabled={!canEdit}
            delay={index * 0.08}
            onSelect={(id) => onSaveTheme?.(id)}
          />
        ))}
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<VisibilityOutlinedIcon />}
          onClick={onOpenPreview}
          sx={{ fontWeight: 800 }}
        >
          Open themed preview
        </Button>
        <Button
          variant="contained"
          disabled={!canEdit || saving}
          onClick={() => onSaveTheme?.(selectedId)}
          sx={{
            fontWeight: 800,
            bgcolor: '#0f766e',
            '&:hover': { bgcolor: '#0d9488' },
          }}
        >
          {saving ? 'Saving...' : 'Save preferred theme'}
        </Button>
      </Stack>
    </ThemeAnimRoot>
  );
}
