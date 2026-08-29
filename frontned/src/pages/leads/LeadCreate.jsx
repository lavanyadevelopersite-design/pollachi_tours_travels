import { useNavigate } from 'react-router-dom';
import LeadForm from './LeadForm';
import { useLeadMutation } from '../../hooks/queries/useLeads';

export default function LeadCreate() {
  const navigate = useNavigate();
  const { create } = useLeadMutation();

  return (
    <LeadForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/leads')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/leads');
      }}
    />
  );
}
