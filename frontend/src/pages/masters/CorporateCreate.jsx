import { useNavigate } from 'react-router-dom';
import CorporateForm from './CorporateForm';
import { useCorporateMutation } from '../../hooks/queries/useMasters';

export default function CorporateCreate() {
  const navigate = useNavigate();
  const { create } = useCorporateMutation();

  return (
    <CorporateForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/corporates')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/corporates');
      }}
    />
  );
}
