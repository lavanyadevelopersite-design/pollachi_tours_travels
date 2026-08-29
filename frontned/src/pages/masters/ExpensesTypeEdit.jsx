import { useNavigate, useParams } from 'react-router-dom';
import ExpensesTypeForm from './ExpensesTypeForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useExpensesTypeMutation } from '../../hooks/queries/useMasters';

export default function ExpensesTypeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('expensesTypes', masterService.expensesTypes, id);
  const { update } = useExpensesTypeMutation();

  if (isLoading) return <Loader message="Loading expenses type..." />;

  return (
    <ExpensesTypeForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/expenses-types')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/expenses-types');
      }}
    />
  );
}
