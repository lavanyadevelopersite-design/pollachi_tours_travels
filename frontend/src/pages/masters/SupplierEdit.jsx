import { useNavigate, useParams } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useSupplierMutation } from '../../hooks/queries/useMasters';

export default function SupplierEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('suppliers', masterService.suppliers, id);
  const { update } = useSupplierMutation();

  if (isLoading) return <Loader message="Loading vendor..." />;

  return (
    <SupplierForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/suppliers')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/suppliers');
      }}
    />
  );
}
