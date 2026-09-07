import { useNavigate, useParams } from 'react-router-dom';
import DestinationForm from './DestinationForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useDestinationMutation } from '../../hooks/queries/useMasters';

export default function DestinationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('destinations', masterService.destinations, id);
  const { update } = useDestinationMutation();

  if (isLoading) return <Loader message="Loading destination..." />;

  return (
    <DestinationForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/destinations')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/destinations');
      }}
    />
  );
}
