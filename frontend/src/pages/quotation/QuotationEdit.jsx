import { useNavigate, useParams } from 'react-router-dom';
import QuotationForm from './QuotationForm';
import Loader from '../../components/common/Loader';
import quotationService from '../../services/quotation.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useQuotationMutation } from '../../hooks/queries/useQuotations';

export default function QuotationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('quotations', quotationService, id);
  const { update } = useQuotationMutation();

  if (isLoading) return <Loader message="Loading quotation..." />;

  return (
    <QuotationForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/quotations')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/quotations');
      }}
    />
  );
}
