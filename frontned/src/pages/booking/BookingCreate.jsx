import { useNavigate } from 'react-router-dom';
import BookingForm from './BookingForm';
import { useBookingMutation } from '../../hooks/queries/useBookings';

export default function BookingCreate() {
  const navigate = useNavigate();
  const { create } = useBookingMutation();

  return (
    <BookingForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/bookings')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/bookings');
      }}
    />
  );
}
