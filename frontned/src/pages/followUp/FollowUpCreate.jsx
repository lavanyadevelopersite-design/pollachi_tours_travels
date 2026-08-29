import { useNavigate } from 'react-router-dom';
import FollowUpForm from './FollowUpForm';
import { useFollowUpMutation } from '../../hooks/queries/useModules';

export default function FollowUpCreate() {
  const navigate = useNavigate();
  const { create } = useFollowUpMutation();

  return (
    <FollowUpForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/follow-ups')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/follow-ups');
      }}
    />
  );
}
