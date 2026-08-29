import { useNavigate, useParams } from 'react-router-dom';
import PackageTermsForm from './PackageTermsForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { usePackageTermsMutation } from '../../hooks/queries/useMasters';

export default function PackageTermsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('packageTerms', masterService.packageTerms, id);
  const { update } = usePackageTermsMutation();

  if (isLoading) return <Loader message="Loading package terms..." />;

  return (
    <PackageTermsForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/package-terms')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/package-terms');
      }}
    />
  );
}
