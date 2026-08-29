import { useNavigate, useParams } from 'react-router-dom';
import LeadSourceTypeForm from './LeadSourceTypeForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useLeadSourceTypeMutation } from '../../hooks/queries/useMasters';

export default function LeadSourceTypeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery(
    'leadSourceTypes',
    masterService.leadSourceTypes,
    id
  );
  const { update } = useLeadSourceTypeMutation();

  if (isLoading) return <Loader message="Loading lead source type..." />;

  return (
    <LeadSourceTypeForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/lead-source-types')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/lead-source-types');
      }}
    />
  );
}
