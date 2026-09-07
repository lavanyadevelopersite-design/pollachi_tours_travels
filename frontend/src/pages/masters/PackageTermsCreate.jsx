import { useNavigate } from 'react-router-dom';
import PackageTermsForm from './PackageTermsForm';
import { usePackageTermsMutation } from '../../hooks/queries/useMasters';

export default function PackageTermsCreate() {
  const navigate = useNavigate();
  const { create } = usePackageTermsMutation();

  return (
    <PackageTermsForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/package-terms')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/package-terms');
      }}
    />
  );
}
