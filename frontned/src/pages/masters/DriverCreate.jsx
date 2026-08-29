import { useNavigate } from 'react-router-dom';
import DriverForm from './DriverForm';
import { useDriverMutation } from '../../hooks/queries/useMasters';

export default function DriverCreate() {
  const navigate = useNavigate();
  const { create } = useDriverMutation();

  return (
    <DriverForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/drivers')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/drivers');
      }}
    />
  );
}
