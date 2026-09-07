import { useNavigate } from 'react-router-dom';
import CurrencyForm from './CurrencyForm';
import { useCurrencyMutation } from '../../hooks/queries/useMasters';

export default function CurrencyCreate() {
  const navigate = useNavigate();
  const { create } = useCurrencyMutation();

  return (
    <CurrencyForm
      open
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/currencies')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/currencies');
      }}
    />
  );
}
