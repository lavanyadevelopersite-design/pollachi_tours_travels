import { useNavigate } from 'react-router-dom';
import InclusionExclusionForm from './InclusionExclusionForm';
import { useInclusionExclusionMutation } from '../../hooks/queries/useMasters';

export default function InclusionExclusionCreate() {
  const navigate = useNavigate();
  const { create } = useInclusionExclusionMutation();

  return (
    <InclusionExclusionForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/inclusion-exclusions')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/inclusion-exclusions');
      }}
    />
  );
}
