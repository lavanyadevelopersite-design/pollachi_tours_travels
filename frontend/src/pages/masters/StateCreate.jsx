import { useNavigate } from 'react-router-dom';
import StateForm from './StateForm';
import { useStateMutation } from '../../hooks/queries/useMasters';

export default function StateCreate() {
  const navigate = useNavigate();
  const { create } = useStateMutation();

  return (
    <StateForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/states')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/states');
      }}
    />
  );
}
