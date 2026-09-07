import { useNavigate, useParams } from 'react-router-dom';
import DepartmentForm from './DepartmentForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useDepartmentMutation } from '../../hooks/queries/useMasters';

export default function DepartmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('departments', masterService.departments, id);
  const { update } = useDepartmentMutation();

  if (isLoading) return <Loader message="Loading department..." />;

  return (
    <DepartmentForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/departments')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/departments');
      }}
    />
  );
}
