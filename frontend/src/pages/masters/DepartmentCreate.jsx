import { useNavigate } from 'react-router-dom';
import DepartmentForm from './DepartmentForm';
import { useDepartmentMutation } from '../../hooks/queries/useMasters';

export default function DepartmentCreate() {
  const navigate = useNavigate();
  const { create } = useDepartmentMutation();

  return (
    <DepartmentForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/departments')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/departments');
      }}
    />
  );
}
