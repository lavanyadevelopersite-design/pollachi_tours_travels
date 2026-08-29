import { useNavigate } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import { useSupplierMutation } from '../../hooks/queries/useMasters';

export default function SupplierCreate() {
  const navigate = useNavigate();
  const { create } = useSupplierMutation();

  return (
    <SupplierForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/suppliers')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/suppliers');
      }}
    />
  );
}
