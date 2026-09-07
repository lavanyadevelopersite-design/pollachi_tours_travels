import { useNavigate, useParams } from 'react-router-dom';
import GuideForm from './GuideForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useGuideMutation } from '../../hooks/queries/useMasters';

export default function GuideEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('guides', masterService.guides, id);
  const { update } = useGuideMutation();

  if (isLoading) return <Loader message="Loading guide..." />;

  return (
    <GuideForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/guides')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, data: payload });
        navigate('/masters/guides');
      }}
    />
  );
}
