import { useNavigate, useParams } from 'react-router-dom';
import LeadForm from './LeadForm';
import Loader from '../../components/common/Loader';
import { useLead, useLeadMutation } from '../../hooks/queries/useLeads';

export default function LeadEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useLead(id);
  const { update } = useLeadMutation();

  if (isLoading) return <Loader message="Loading lead..." />;

  return (
    <LeadForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/leads')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/leads');
      }}
    />
  );
}
