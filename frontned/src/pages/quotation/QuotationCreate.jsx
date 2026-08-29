import { useNavigate } from 'react-router-dom';
import QuotationForm from './QuotationForm';
import { useQuotationMutation } from '../../hooks/queries/useQuotations';

export default function QuotationCreate() {
  const navigate = useNavigate();
  const { create } = useQuotationMutation();

  return (
    <QuotationForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/quotations')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/quotations');
      }}
    />
  );
}
