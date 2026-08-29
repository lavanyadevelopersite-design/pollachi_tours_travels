import { useNavigate } from 'react-router-dom';
import HotelForm from './HotelForm';
import { useHotelMutation } from '../../hooks/queries/useMasters';

export default function HotelCreate() {
  const navigate = useNavigate();
  const { create } = useHotelMutation();

  return (
    <HotelForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/hotels')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/hotels');
      }}
    />
  );
}
