import { useNavigate } from 'react-router-dom';
import BranchForm from './BranchForm';
import { useBranchMutation } from '../../hooks/queries/useMasters';

export default function BranchCreate() {
  const navigate = useNavigate();
  const { create } = useBranchMutation();

  return (
    <BranchForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/branches')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/branches');
      }}
    />
  );
}
