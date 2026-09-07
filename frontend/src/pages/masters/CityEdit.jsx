import { useNavigate, useParams } from 'react-router-dom';
import CityForm from './CityForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useCityMutation } from '../../hooks/queries/useMasters';

export default function CityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('cities', masterService.cities, id);
  const { update } = useCityMutation();

  if (isLoading) return <Loader message="Loading city..." />;

  return (
    <CityForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/cities')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/cities');
      }}
    />
  );
}
