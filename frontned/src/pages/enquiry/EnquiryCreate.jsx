import { useNavigate } from 'react-router-dom';
import EnquiryForm from './EnquiryForm';
import { useEnquiryMutation } from '../../hooks/queries/useEnquiry';
import { useAuth } from '../../hooks/useAuth';

export default function EnquiryCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { create } = useEnquiryMutation();

  return (
    <EnquiryForm
      mode="create"
      loading={create.isPending}
      onCancel={() => navigate('/enquiry')}
      onSubmit={async (payload) => {
        await create.mutateAsync({
          ...payload,
          assigned_to: payload.assigned_to || user?.id || null,
        });
        navigate('/enquiry');
      }}
    />
  );
}
