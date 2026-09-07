import { useNavigate, useParams } from 'react-router-dom';
import LeadStatusForm from './LeadStatusForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useLeadStatusMutation } from '../../hooks/queries/useMasters';

export default function LeadStatusEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('leadStatuses', masterService.leadStatuses, id);
  const { update } = useLeadStatusMutation();

  if (isLoading) return <Loader message="Loading lead status..." />;

  return (
    <LeadStatusForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/lead-statuses')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/lead-statuses');
      }}
    />
  );
}
