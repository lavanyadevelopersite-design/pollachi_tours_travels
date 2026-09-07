import { useNavigate, useParams } from 'react-router-dom';
import CorporateForm from './CorporateForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useCorporateMutation } from '../../hooks/queries/useMasters';

export default function CorporateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('corporates', masterService.corporates, id);
  const { update } = useCorporateMutation();

  if (isLoading) return <Loader message="Loading corporate..." />;

  return (
    <CorporateForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/corporates')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/corporates');
      }}
    />
  );
}
