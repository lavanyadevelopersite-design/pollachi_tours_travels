import { Box, Button, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ThemedItineraryDocument from '../../components/itinerary/ThemedItineraryDocument';
import { useItinerary } from '../../hooks/queries/useModules';
import { getItineraryThemeId } from '../../utils/itineraryThemes';

export default function ItineraryPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useItinerary(id);

  if (isLoading && !data) return <Loader message="Loading preview..." />;
  if (!data) return <EmptyState title="Itinerary not found" />;

  const themeId = getItineraryThemeId(data);

  return (
    <Box className="print-document" sx={{ maxWidth: { xs: '100%', sm: themeId === 'scenic_escape' ? 980 : 960 }, mx: 'auto', px: { xs: 1, sm: 0 }, pb: 4 }}>
      <Stack className="no-print" direction="row" mb={2.5}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/itineraries/view/${id}`)}>
          Back to Planner
        </Button>
      </Stack>

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 0,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 18px 50px rgba(21,34,56,0.12)',
          '@media print': {
            border: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            overflow: 'visible',
          },
        }}
      >
        <ThemedItineraryDocument data={data} />
      </Box>
    </Box>
  );
}
