import { useNavigate } from 'react-router-dom';
import UserForm from './UserForm';
import { useUserMutation } from '../../hooks/queries/useUsers';

export default function UserCreate() {
  const navigate = useNavigate();
  const { create } = useUserMutation();

  return (
    <UserForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/users')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/users');
      }}
    />
  );
}
