import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FollowUpForm from './FollowUpForm';
import { useFollowUpMutation } from '../../hooks/queries/useModules';

export default function FollowUpCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { create } = useFollowUpMutation();
  const initialData = useMemo(() => {
    const enquiryId = params.get('enquiry_id') || params.get('relatedId');
    if (!enquiryId) return null;
    return { enquiry_id: enquiryId };
  }, [params]);

  return (
    <FollowUpForm
      mode="create"
      initialData={initialData}
      loading={create.isPending}
      onCancel={() => navigate('/follow-ups')}
      onSubmit={async (payload) => {
        await create.mutateAsync(payload);
        navigate('/follow-ups');
      }}
    />
  );
}
