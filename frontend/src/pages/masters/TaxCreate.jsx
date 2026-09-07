import { useNavigate } from 'react-router-dom';
import TaxForm from './TaxForm';
import { useTaxMutation } from '../../hooks/queries/useMasters';

export default function TaxCreate() {
  const navigate = useNavigate();
  const { create } = useTaxMutation();

  return (
    <TaxForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/taxes')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/taxes');
      }}
    />
  );
}
