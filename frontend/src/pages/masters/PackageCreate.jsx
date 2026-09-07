import { useNavigate } from 'react-router-dom';
import PackageForm from './PackageForm';
import { usePackageMutation } from '../../hooks/queries/useMasters';

export default function PackageCreate() {
  const navigate = useNavigate();
  const { create } = usePackageMutation();

  return (
    <PackageForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/packages')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/packages');
      }}
    />
  );
}
