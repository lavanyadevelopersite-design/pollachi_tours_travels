import { useNavigate, useParams } from 'react-router-dom';
import FollowUpForm from './FollowUpForm';
import Loader from '../../components/common/Loader';
import { followUpService } from '../../services/common.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useFollowUpMutation } from '../../hooks/queries/useModules';

export default function FollowUpEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('follow-ups', followUpService, id);
  const { update } = useFollowUpMutation();

  if (isLoading) return <Loader message="Loading follow-up..." />;

  return (
    <FollowUpForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/follow-ups')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/follow-ups');
      }}
    />
  );
}
