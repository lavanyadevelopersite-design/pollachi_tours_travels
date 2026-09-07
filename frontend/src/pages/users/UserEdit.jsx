import { useNavigate, useParams } from 'react-router-dom';
import UserForm from './UserForm';
import Loader from '../../components/common/Loader';
import userService from '../../services/user.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useUserMutation } from '../../hooks/queries/useUsers';

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('users', userService, id);
  const { update } = useUserMutation();

  if (isLoading) return <Loader message="Loading user..." />;

  return (
    <UserForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/users')}
      onDone={() => navigate('/users')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
      }}
    />
  );
}
