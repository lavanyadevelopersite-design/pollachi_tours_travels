import { useNavigate } from 'react-router-dom';
import LeadSourceTypeForm from './LeadSourceTypeForm';
import { useLeadSourceTypeMutation } from '../../hooks/queries/useMasters';

export default function LeadSourceTypeCreate() {
  const navigate = useNavigate();
  const { create } = useLeadSourceTypeMutation();

  return (
    <LeadSourceTypeForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/lead-source-types')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/lead-source-types');
      }}
    />
  );
}
