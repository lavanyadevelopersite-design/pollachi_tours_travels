import { useNavigate, useParams } from 'react-router-dom';
import InvoiceForm from './InvoiceForm';
import Loader from '../../components/common/Loader';
import { invoiceService } from '../../services/common.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useInvoiceMutation } from '../../hooks/queries/useModules';

export default function InvoiceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('invoices', invoiceService, id);
  const { update } = useInvoiceMutation();

  if (isLoading) return <Loader message="Loading invoice..." />;

  return (
    <InvoiceForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/invoices')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/invoices');
      }}
    />
  );
}
