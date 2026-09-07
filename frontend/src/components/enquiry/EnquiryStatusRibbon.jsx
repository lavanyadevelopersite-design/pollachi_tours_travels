import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { groupStatusesByPipeline } from '../../utils/leadStatusPipeline';

const NAVY = '#1E3A5F';

function displayName(status) {
  return String(status?.name || '').trim() || '—';
}

export default function EnquiryStatusRibbon({
  total = 0,
  statuses = [],
  selectedId = '',
  onSelect,
  loading = false,
}) {
  const groups = groupStatusesByPipeline(statuses);
  const totalSelected = !selectedId;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        component="button"
        type="button"
        onClick={() => onSelect?.('')}
        title="Show all enquiries"
        sx={{
          appearance: 'none',
          border: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minWidth: 168,
          mb: 1.5,
          px: 2,
          py: 1.25,
          borderRadius: 1.5,
          bgcolor: '#fff',
          textAlign: 'left',
          boxShadow: totalSelected
            ? `inset 4px 0 0 ${NAVY}, 0 0 0 1px ${alpha(NAVY, 0.18)}`
            : `inset 4px 0 0 ${NAVY}, 0 0 0 1px ${alpha('#0F172A', 0.08)}`,
          '&:hover': { bgcolor: alpha(NAVY, 0.03) },
        }}
      >
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: NAVY }}>
          {loading ? '—' : total}
        </Typography>
        <Typography
          sx={{
            mt: 0.25,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: alpha(NAVY, 0.7),
          }}
        >
          TOTAL ENQUIRIES
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: `repeat(${Math.max(groups.length, 1)}, minmax(0, 1fr))`,
          },
          gap: 1.25,
        }}
      >
        {groups.map((group) => (
          <Box
            key={group.key}
            sx={{
              bgcolor: '#fff',
              borderRadius: 1.5,
              overflow: 'hidden',
              border: `1px solid ${alpha('#0F172A', 0.08)}`,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                bgcolor: group.color,
                px: 1.5,
                py: 0.85,
              }}
            >
              <Typography
                sx={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                }}
              >
                {group.title}
              </Typography>
            </Box>

            <Box sx={{ py: 0.25 }}>
              {group.statuses.map((status) => {
                const selected = Boolean(status.id) && status.id === selectedId;
                const count = Number(status.count || 0);
                const active = count > 0;

                return (
                  <Box
                    key={status.id}
                    component="button"
                    type="button"
                    onClick={() => onSelect?.(status.id)}
                    title={`Filter by ${displayName(status)}`}
                    sx={{
                      appearance: 'none',
                      border: 0,
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      px: 1.5,
                      py: 0.85,
                      bgcolor: selected ? alpha(group.color, 0.12) : 'transparent',
                      boxShadow: selected ? `inset 3px 0 0 ${group.color}` : 'none',
                      '&:hover': {
                        bgcolor: selected ? alpha(group.color, 0.16) : alpha('#0F172A', 0.03),
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: selected ? 700 : 500,
                        color: selected ? group.color : NAVY,
                        textAlign: 'left',
                        lineHeight: 1.3,
                        minWidth: 0,
                      }}
                    >
                      {displayName(status)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: active ? 800 : 500,
                        color: loading ? alpha(NAVY, 0.35) : active ? NAVY : alpha(NAVY, 0.4),
                        flexShrink: 0,
                      }}
                    >
                      {loading ? '—' : count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
