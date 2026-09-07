import { useNavigate, useParams } from 'react-router-dom';
import AgentForm from './AgentForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useAgentMutation } from '../../hooks/queries/useMasters';

export default function AgentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('agents', masterService.agents, id);
  const { update } = useAgentMutation();

  if (isLoading) return <Loader message="Loading agent..." />;

  return (
    <AgentForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/agents')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/agents');
      }}
    />
  );
}
