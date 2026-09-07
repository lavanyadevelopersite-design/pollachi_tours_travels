import { useNavigate } from 'react-router-dom';
import VehicleForm from './VehicleForm';
import { useVehicleMutation } from '../../hooks/queries/useMasters';

export default function VehicleCreate() {
  const navigate = useNavigate();
  const { create } = useVehicleMutation();

  return (
    <VehicleForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/vehicles')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/vehicles');
      }}
    />
  );
}
