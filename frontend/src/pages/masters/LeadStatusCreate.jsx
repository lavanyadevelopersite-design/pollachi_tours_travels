import { useNavigate } from 'react-router-dom';
import LeadStatusForm from './LeadStatusForm';
import { useLeadStatusMutation } from '../../hooks/queries/useMasters';

export default function LeadStatusCreate() {
  const navigate = useNavigate();
  const { create } = useLeadStatusMutation();

  return (
    <LeadStatusForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/lead-statuses')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/lead-statuses');
      }}
    />
  );
}
