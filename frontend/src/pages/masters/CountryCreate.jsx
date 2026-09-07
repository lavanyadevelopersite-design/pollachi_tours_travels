import { useNavigate } from 'react-router-dom';
import CountryForm from './CountryForm';
import { useCountryMutation } from '../../hooks/queries/useMasters';

export default function CountryCreate() {
  const navigate = useNavigate();
  const { create } = useCountryMutation();

  return (
    <CountryForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/masters/countries')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/masters/countries');
      }}
    />
  );
}
