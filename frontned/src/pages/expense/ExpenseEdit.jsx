import { useNavigate, useParams } from 'react-router-dom';
import ExpenseForm from './ExpenseForm';
import Loader from '../../components/common/Loader';
import { expenseService } from '../../services/common.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useExpenseMutation } from '../../hooks/queries/useModules';

export default function ExpenseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('expenses', expenseService, id);
  const { update } = useExpenseMutation();

  if (isLoading) return <Loader message="Loading expense..." />;

  return (
    <ExpenseForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/expenses')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/expenses');
      }}
    />
  );
}
