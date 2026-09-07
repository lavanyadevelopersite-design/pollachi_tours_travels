import { useNavigate } from 'react-router-dom';
import AgentForm from './AgentForm';
import { useAgentMutation } from '../../hooks/queries/useMasters';

export default function AgentCreate() {
  const navigate = useNavigate();
  const { create } = useAgentMutation();

  return (
    <AgentForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/agents')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/agents');
      }}
    />
  );
}
