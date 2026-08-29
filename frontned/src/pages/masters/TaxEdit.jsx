import { useNavigate, useParams } from 'react-router-dom';
import TaxForm from './TaxForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useTaxMutation } from '../../hooks/queries/useMasters';

export default function TaxEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('taxes', masterService.taxes, id);
  const { update } = useTaxMutation();

  if (isLoading) return <Loader message="Loading tax..." />;

  return (
    <TaxForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/taxes')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/taxes');
      }}
    />
  );
}
