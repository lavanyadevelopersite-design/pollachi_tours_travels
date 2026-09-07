import { useNavigate, useParams } from 'react-router-dom';
import PackageForm from './PackageForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { usePackageMutation } from '../../hooks/queries/useMasters';

export default function PackageEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('packages', masterService.packages, id);
  const { update } = usePackageMutation();

  if (isLoading) return <Loader message="Loading package..." />;

  return (
    <PackageForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/packages')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/packages');
      }}
    />
  );
}
