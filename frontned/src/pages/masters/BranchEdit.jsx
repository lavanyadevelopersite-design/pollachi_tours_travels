import { useNavigate, useParams } from 'react-router-dom';
import BranchForm from './BranchForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useBranchMutation } from '../../hooks/queries/useMasters';

export default function BranchEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('branches', masterService.branches, id);
  const { update } = useBranchMutation();

  if (isLoading) return <Loader message="Loading branch..." />;

  return (
    <BranchForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/branches')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/branches');
      }}
    />
  );
}
