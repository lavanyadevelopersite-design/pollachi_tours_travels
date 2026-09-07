import { useNavigate } from 'react-router-dom';
import CityForm from './CityForm';
import { useCityMutation } from '../../hooks/queries/useMasters';

export default function CityCreate() {
  const navigate = useNavigate();
  const { create } = useCityMutation();

  return (
    <CityForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/cities')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/cities');
      }}
    />
  );
}
