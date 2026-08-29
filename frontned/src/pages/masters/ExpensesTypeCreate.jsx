import { useNavigate } from 'react-router-dom';
import ExpensesTypeForm from './ExpensesTypeForm';
import { useExpensesTypeMutation } from '../../hooks/queries/useMasters';

export default function ExpensesTypeCreate() {
  const navigate = useNavigate();
  const { create } = useExpensesTypeMutation();

  return (
    <ExpensesTypeForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/expenses-types')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/expenses-types');
      }}
    />
  );
}
