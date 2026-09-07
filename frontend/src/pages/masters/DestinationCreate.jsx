import { useNavigate } from 'react-router-dom';
import DestinationForm from './DestinationForm';
import { useDestinationMutation } from '../../hooks/queries/useMasters';

export default function DestinationCreate() {
  const navigate = useNavigate();
  const { create } = useDestinationMutation();

  return (
    <DestinationForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/destinations')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/destinations');
      }}
    />
  );
}
