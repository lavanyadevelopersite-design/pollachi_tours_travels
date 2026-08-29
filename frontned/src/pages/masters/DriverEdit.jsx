import { useNavigate, useParams } from 'react-router-dom';
import DriverForm from './DriverForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useDriverMutation } from '../../hooks/queries/useMasters';

export default function DriverEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('drivers', masterService.drivers, id);
  const { update } = useDriverMutation();

  if (isLoading) return <Loader message="Loading driver..." />;

  return (
    <DriverForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/drivers')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, data: payload });
        navigate('/masters/drivers');
      }}
    />
  );
}
