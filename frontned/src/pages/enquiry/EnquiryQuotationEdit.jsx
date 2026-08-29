import { useMemo } from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ItineraryPricingTab from '../../components/itinerary/ItineraryPricingTab';
import { useEnquiry } from '../../hooks/queries/useEnquiry';
import { useItinerary } from '../../hooks/queries/useModules';
import {
  useQuotationByEnquiryItinerary,
  useQuotationUpsert,
  useStandaloneQuotation,
} from '../../hooks/queries/useQuotations';
import { coercePricing, resolveLineItems } from '../../utils/itineraryPricing';

/**
 * Full-page quotation pricing editor.
 * Works with a confirmed itinerary, or as a standalone enquiry quotation (no itinerary).
 */
export default function EnquiryQuotationEdit() {
  const { enquiryId, itineraryId } = useParams();
  const navigate = useNavigate();
  const isDirect = itineraryId === 'direct';

  const { data: enquiry, isLoading: loadingEnquiry } = useEnquiry(enquiryId);
  const { data: itinerary, isLoading: loadingItinerary } = useItinerary(isDirect ? null : itineraryId);
  const { data: itineraryQuotation, isLoading: loadingItineraryQuotation } =
    useQuotationByEnquiryItinerary(enquiryId, itineraryId, !isDirect);
  const { data: standaloneQuotation, isLoading: loadingStandalone } = useStandaloneQuotation(
    enquiryId,
    isDirect
  );
  const quotation = isDirect ? standaloneQuotation : itineraryQuotation;
  const upsert = useQuotationUpsert();

  const days = useMemo(
    () =>
      isDirect
        ? []
        : [...(itinerary?.itineraryDays || [])].sort((a, b) => a.day_number - b.day_number),
    [isDirect, itinerary]
  );

  const pricingData = useMemo(() => {
    if (isDirect) {
      if (!enquiry) return null;
      const source = quotation?.pricing || {};
      const base = coercePricing(source);
      return {
        id: quotation?.id || `enquiry-${enquiry.id}`,
        title: enquiry.enquiry_code ? `Quotation · ${enquiry.enquiry_code}` : 'Quotation',
        adults: enquiry.adults ?? 1,
        children: enquiry.children ?? 0,
        destinations: enquiry.destination ? [enquiry.destination] : [],
        from_date: enquiry.travel_from,
        to_date: enquiry.travel_to,
        pricing: {
          ...base,
          line_items: resolveLineItems([], base.line_items || []),
        },
      };
    }
    if (!itinerary) return null;
    const source = quotation?.pricing || itinerary.pricing || {};
    const base = coercePricing(source);
    return {
      ...itinerary,
      pricing: {
        ...base,
        line_items: resolveLineItems(days, base.line_items || []),
      },
    };
  }, [isDirect, enquiry, itinerary, quotation, days]);

  const handleSave = async (pricing) => {
    await upsert.mutateAsync({
      enquiry_id: enquiryId,
      itinerary_id: isDirect ? null : itineraryId,
      pricing,
      status: quotation?.status || 'draft',
    });
  };

  const isLoading =
    loadingEnquiry ||
    (isDirect ? loadingStandalone : loadingItinerary || loadingItineraryQuotation);

  if (isLoading && !pricingData) return <Loader message="Loading quotation pricing..." />;
  if (!pricingData) return <EmptyState title="Quotation / itinerary not found" />;

  const viewPath = `/enquiry/${enquiryId}/quotation/${isDirect ? 'direct' : itineraryId}`;

  return (
    <Box sx={{ pb: 4, maxWidth: 1100, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
        mb={2.5}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/enquiry/view/${enquiryId}`)}
            sx={{ mb: 0.5 }}
          >
            Back to Enquiry
          </Button>
          <Typography variant="h5" fontWeight={900} color="#92400e">
            Edit Quotation Pricing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {enquiry?.enquiry_code ? `${enquiry.enquiry_code} · ` : ''}
            {pricingData.title || 'Quotation'} — saved against this enquiry only
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<VisibilityOutlinedIcon />}
          onClick={() => window.open(viewPath, '_blank', 'noopener,noreferrer')}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderColor: '#2563eb',
            color: '#2563eb',
            bgcolor: 'transparent',
            alignSelf: { xs: 'stretch', sm: 'center' },
            '&:hover': {
              borderColor: '#1d4ed8',
              color: '#1d4ed8',
              bgcolor: alpha('#2563eb', 0.06),
            },
          }}
        >
          View Quotation
        </Button>
      </Stack>

      <Box
        sx={{
          p: { xs: 1.5, md: 2.5 },
          borderRadius: 3,
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: alpha('#d97706', 0.22),
          boxShadow: '0 12px 32px rgba(217,119,6,0.08)',
        }}
      >
        <ItineraryPricingTab
          data={pricingData}
          days={days}
          canEdit
          saving={upsert.isPending}
          onSave={handleSave}
          allowManualItems={isDirect}
        />
      </Box>
    </Box>
  );
}
