import { useNavigate, useParams } from 'react-router-dom';
import DesignationForm from './DesignationForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useDesignationMutation } from '../../hooks/queries/useMasters';

export default function DesignationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('designations', masterService.designations, id);
  const { update } = useDesignationMutation();

  if (isLoading) return <Loader message="Loading designation..." />;

  return (
    <DesignationForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/designations')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/designations');
      }}
    />
  );
}
