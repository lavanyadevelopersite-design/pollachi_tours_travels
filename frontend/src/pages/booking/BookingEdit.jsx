import { useNavigate, useParams } from 'react-router-dom';
import BookingForm from './BookingForm';
import Loader from '../../components/common/Loader';
import bookingService from '../../services/booking.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useBookingMutation } from '../../hooks/queries/useBookings';

export default function BookingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('bookings', bookingService, id);
  const { update } = useBookingMutation();

  if (isLoading) return <Loader message="Loading booking..." />;

  return (
    <BookingForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/bookings')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/bookings');
      }}
    />
  );
}
