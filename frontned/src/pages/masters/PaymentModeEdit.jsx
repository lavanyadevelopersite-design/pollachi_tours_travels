import { useNavigate, useParams } from 'react-router-dom';
import PaymentModeForm from './PaymentModeForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { usePaymentModeMutation } from '../../hooks/queries/useMasters';

export default function PaymentModeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('paymentModes', masterService.paymentModes, id);
  const { update } = usePaymentModeMutation();

  if (isLoading) return <Loader message="Loading payment mode..." />;

  return (
    <PaymentModeForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/payment-modes')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/payment-modes');
      }}
    />
  );
}
