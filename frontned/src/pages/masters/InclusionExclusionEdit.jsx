import { useNavigate, useParams } from 'react-router-dom';
import InclusionExclusionForm from './InclusionExclusionForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useInclusionExclusionMutation } from '../../hooks/queries/useMasters';

export default function InclusionExclusionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery(
    'inclusionExclusions',
    masterService.inclusionExclusions,
    id
  );
  const { update } = useInclusionExclusionMutation();

  if (isLoading) return <Loader message="Loading..." />;

  return (
    <InclusionExclusionForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/inclusion-exclusions')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/inclusion-exclusions');
      }}
    />
  );
}
