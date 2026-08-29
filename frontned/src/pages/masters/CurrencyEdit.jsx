import { useNavigate, useParams } from 'react-router-dom';
import CurrencyForm from './CurrencyForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useCurrencyMutation } from '../../hooks/queries/useMasters';

export default function CurrencyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('currencies', masterService.currencies, id);
  const { update } = useCurrencyMutation();

  if (isLoading) return <Loader message="Loading currency..." />;

  return (
    <CurrencyForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/currencies')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/currencies');
      }}
    />
  );
}
