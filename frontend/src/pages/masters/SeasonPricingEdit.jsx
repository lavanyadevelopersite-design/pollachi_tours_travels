import { useNavigate, useParams } from 'react-router-dom';
import SeasonPricingForm from './SeasonPricingForm';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useSeasonPricingMutation } from '../../hooks/queries/useMasters';

export default function SeasonPricingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEntityQuery('seasonPricing', masterService.seasonPricing, id);
  const { update } = useSeasonPricingMutation();

  if (isLoading) return <Loader message="Loading season pricing..." />;

  return (
    <SeasonPricingForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/masters/season-pricing')}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/masters/season-pricing');
      }}
    />
  );
}
