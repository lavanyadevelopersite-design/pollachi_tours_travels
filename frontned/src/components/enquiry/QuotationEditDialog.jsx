import { useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  alpha,
} from '@mui/material';
import ItineraryPricingTab from '../itinerary/ItineraryPricingTab';
import Loader from '../common/Loader';
import { useItinerary } from '../../hooks/queries/useModules';
import { useQuotationUpsert } from '../../hooks/queries/useQuotations';
import { coercePricing, syncLineItemsFromEvents } from '../../utils/itineraryPricing';

/**
 * Edit quotation pricing for an enquiry itinerary.
 * Saves to quotations table only — does not update itinerary.pricing.
 */
export default function QuotationEditDialog({
  open,
  onClose,
  enquiry,
  itinerary: listItem,
  quotation,
}) {
  const itineraryId = listItem?.id || quotation?.itinerary_id;
  const { data: itinerary, isLoading } = useItinerary(open ? itineraryId : null);
  const upsert = useQuotationUpsert();

  const days = itinerary?.itineraryDays || [];

  const pricingData = useMemo(() => {
    const source = quotation?.pricing || itinerary?.pricing || {};
    const base = coercePricing(source);
    return {
      ...itinerary,
      pricing: {
        ...base,
        line_items: syncLineItemsFromEvents(days, base.line_items || []),
      },
    };
  }, [quotation?.pricing, itinerary, days]);

  const handleSave = async (pricing) => {
    await upsert.mutateAsync({
      enquiry_id: enquiry.id,
      itinerary_id: itineraryId,
      pricing,
      status: quotation?.status || 'draft',
    });
    onClose(true);
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle fontWeight={800}>
        Edit Quotation Pricing
        <Typography variant="body2" color="text.secondary" fontWeight={500} mt={0.5}>
          Changes are saved against this enquiry quotation only — itinerary pricing is not updated.
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: alpha('#0f172a', 0.02) }}>
        {isLoading || !pricingData?.id ? (
          <Loader message="Loading pricing..." />
        ) : (
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              p: { xs: 1.5, md: 2 },
            }}
          >
            <ItineraryPricingTab
              data={pricingData}
              days={days}
              canEdit
              saving={upsert.isPending}
              onSave={handleSave}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => onClose(false)} color="inherit" disabled={upsert.isPending}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
