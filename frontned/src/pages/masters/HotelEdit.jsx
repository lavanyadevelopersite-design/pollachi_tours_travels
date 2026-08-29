import { useNavigate, useParams } from 'react-router-dom';
import HotelForm from './HotelForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useHotelMutation } from '../../hooks/queries/useMasters';

export default function HotelEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('hotels', masterService.hotels, id);
  const { update } = useHotelMutation();

  if (isLoading) return <Loader message="Loading hotel..." />;

  return (
    <HotelForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/hotels')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/hotels');
      }}
    />
  );
}
