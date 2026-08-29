import { useNavigate } from 'react-router-dom';
import PaymentModeForm from './PaymentModeForm';
import { usePaymentModeMutation } from '../../hooks/queries/useMasters';

export default function PaymentModeCreate() {
  const navigate = useNavigate();
  const { create } = usePaymentModeMutation();

  return (
    <PaymentModeForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/payment-modes')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/payment-modes');
      }}
    />
  );
}
