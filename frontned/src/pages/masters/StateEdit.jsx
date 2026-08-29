import { useNavigate, useParams } from 'react-router-dom';
import StateForm from './StateForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useStateMutation } from '../../hooks/queries/useMasters';

export default function StateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('states', masterService.states, id);
  const { update } = useStateMutation();

  if (isLoading) return <Loader message="Loading state..." />;

  return (
    <StateForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/states')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/states');
      }}
    />
  );
}
