import { useNavigate } from 'react-router-dom';
import InvoiceForm from './InvoiceForm';
import { useInvoiceMutation } from '../../hooks/queries/useModules';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const { create } = useInvoiceMutation();

  return (
    <InvoiceForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/invoices')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/invoices');
      }}
    />
  );
}
