import { useNavigate } from 'react-router-dom';
import GuideForm from './GuideForm';
import { useGuideMutation } from '../../hooks/queries/useMasters';

export default function GuideCreate() {
  const navigate = useNavigate();
  const { create } = useGuideMutation();

  return (
    <GuideForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/guides')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/guides');
      }}
    />
  );
}
