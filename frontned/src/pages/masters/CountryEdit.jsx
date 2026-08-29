import { useNavigate, useParams } from 'react-router-dom';
import CountryForm from './CountryForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useCountryMutation } from '../../hooks/queries/useMasters';

export default function CountryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('countries', masterService.countries, id);
  const { update } = useCountryMutation();

  if (isLoading) return <Loader message="Loading country..." />;

  return (
    <CountryForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/countries')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/countries');
      }}
    />
  );
}
