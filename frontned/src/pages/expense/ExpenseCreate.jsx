import { useNavigate } from 'react-router-dom';
import ExpenseForm from './ExpenseForm';
import { useExpenseMutation } from '../../hooks/queries/useModules';

export default function ExpenseCreate() {
  const navigate = useNavigate();
  const { create } = useExpenseMutation();

  return (
    <ExpenseForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/expenses')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/expenses');
      }}
    />
  );
}
