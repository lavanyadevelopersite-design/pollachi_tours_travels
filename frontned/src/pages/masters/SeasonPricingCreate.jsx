import { useNavigate } from 'react-router-dom';
import SeasonPricingForm from './SeasonPricingForm';
import { useSeasonPricingMutation } from '../../hooks/queries/useMasters';

export default function SeasonPricingCreate() {
  const navigate = useNavigate();
  const { create } = useSeasonPricingMutation();

  return (
    <SeasonPricingForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/season-pricing')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/season-pricing');
      }}
    />
  );
}
