import { useNavigate } from 'react-router-dom';
import DesignationForm from './DesignationForm';
import { useDesignationMutation } from '../../hooks/queries/useMasters';

export default function DesignationCreate() {
  const navigate = useNavigate();
  const { create } = useDesignationMutation();

  return (
    <DesignationForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/designations')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/designations');
      }}
    />
  );
}
