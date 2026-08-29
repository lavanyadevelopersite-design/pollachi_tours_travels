import { useNavigate, useParams } from 'react-router-dom';
import VehicleForm from './VehicleForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useVehicleMutation } from '../../hooks/queries/useMasters';

export default function VehicleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('vehicles', masterService.vehicles, id);
  const { update } = useVehicleMutation();

  if (isLoading) return <Loader message="Loading vehicle..." />;

  return (
    <VehicleForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/vehicles')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, data: payload });
        navigate('/masters/vehicles');
      }}
    />
  );
}
