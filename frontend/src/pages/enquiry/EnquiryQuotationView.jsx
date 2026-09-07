import { useMemo } from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import CompanyBankSignatureBlock from '../../components/common/CompanyBankSignatureBlock';
import ItineraryFinalTab from '../../components/itinerary/ItineraryFinalTab';
import { useBranding } from '../../hooks/queries/useBranding';
import { useEnquiry } from '../../hooks/queries/useEnquiry';
import { useItinerary } from '../../hooks/queries/useModules';
import {
  useQuotationByEnquiryItinerary,
  useStandaloneQuotation,
} from '../../hooks/queries/useQuotations';
import { APP_NAME } from '../../utils/constants';
import { coercePricing, resolveLineItems } from '../../utils/itineraryPricing';
import { resolveTripDates, withEnquiryTripFields } from '../../utils/tripDates';

/**
 * Full-page quotation view — same design as itinerary planner Final tab.
 * Supports itinerary quotations and standalone enquiry quotations.
 */
export default function EnquiryQuotationView() {
  const { enquiryId, itineraryId } = useParams();
  const navigate = useNavigate();
  const { data: branding } = useBranding();
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

  const days = useMemo(
    () =>
      isDirect
        ? []
        : [...(itinerary?.itineraryDays || [])].sort((a, b) => a.day_number - b.day_number),
    [isDirect, itinerary]
  );

  const viewData = useMemo(() => {
    if (isDirect) {
      if (!enquiry && !quotation) return null;
      const source = quotation?.pricing || {};
      const base = coercePricing(source);
      return {
        id: quotation?.id || `enquiry-${enquiry?.id}`,
        title: enquiry?.enquiry_code ? `Quotation · ${enquiry.enquiry_code}` : 'Quotation',
        adults: enquiry?.adults ?? quotation?.adults ?? 1,
        children: enquiry?.children ?? quotation?.children ?? 0,
        destinations: enquiry?.destination ? [enquiry.destination] : [],
        from_date: resolveTripDates({ enquiry, quotation }).from,
        to_date: resolveTripDates({ enquiry, quotation }).to,
        pricing: {
          ...base,
          line_items: resolveLineItems([], base.line_items || []),
        },
      };
    }
    if (!itinerary) return null;
    const source = quotation?.pricing || itinerary.pricing || {};
    const base = coercePricing(source);
    const trip = resolveTripDates({ enquiry, itinerary, quotation });
    const withTrip = withEnquiryTripFields(
      {
        ...itinerary,
        from_date: trip.from,
        to_date: trip.to,
      },
      enquiry
    );
    return {
      ...withTrip,
      pricing: {
        ...base,
        line_items: resolveLineItems(days, base.line_items || []),
      },
    };
  }, [isDirect, enquiry, itinerary, quotation, days]);

  const isLoading =
    loadingEnquiry ||
    (isDirect ? loadingStandalone : loadingItinerary || loadingItineraryQuotation);

  if (isLoading && !viewData) return <Loader message="Loading quotation..." />;
  if (!viewData) return <EmptyState title="Quotation / itinerary not found" />;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/enquiry/${enquiryId}/quotation/${isDirect ? 'direct' : itineraryId}`
      : '';

  return (
    <Box sx={{ pb: 4, maxWidth: 1100, mx: 'auto' }}>
      <Stack
        className="no-print"
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
          <Typography variant="h5" fontWeight={900} color="#1e3a8a">
            Quotation View
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {enquiry?.enquiry_code ? `${enquiry.enquiry_code} · ` : ''}
            {enquiry?.customer_name || ''}
            {quotation ? ' · Saved quotation pricing' : isDirect ? ' · Draft quotation' : ' · Using itinerary pricing'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={() =>
            window.open(
              `/enquiry/${enquiryId}/quotation/${isDirect ? 'direct' : itineraryId}/edit`,
              '_blank',
              'noopener,noreferrer'
            )
          }
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderColor: '#d97706',
            color: '#d97706',
            bgcolor: 'transparent',
            alignSelf: { xs: 'stretch', sm: 'center' },
            '&:hover': {
              borderColor: '#b45309',
              color: '#b45309',
              bgcolor: alpha('#d97706', 0.06),
            },
          }}
        >
          Edit Pricing
        </Button>
      </Stack>

      <Box
        sx={{
          p: { xs: 1.5, md: 2.5 },
          borderRadius: 3,
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: alpha('#2563eb', 0.14),
          boxShadow: '0 12px 32px rgba(37,99,235,0.08)',
        }}
      >
        <ItineraryFinalTab
          data={viewData}
          days={days}
          canEdit={false}
          printInPlace
          shareUrlOverride={shareUrl}
          heroOverline={`Quotation · ${branding?.company_name || APP_NAME}`}
        />
        <Box sx={{ px: { xs: 0.5, md: 1 }, pb: 1 }}>
          <CompanyBankSignatureBlock
            branding={branding}
            companyName={branding?.company_name || APP_NAME}
          />
        </Box>
      </Box>
    </Box>
  );
}
