import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EnquiryForm from './EnquiryForm';
import { useEnquiryMutation } from '../../hooks/queries/useEnquiry';

export default function EnquiryCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { create } = useEnquiryMutation();
  const prefill = useMemo(
    () => ({
      customerName: params.get('name') || '',
      phone: params.get('phone') || '',
    }),
    [params]
  );

  return (
    <EnquiryForm
      mode="create"
      prefill={prefill}
      loading={create.isPending}
      onCancel={() => navigate('/enquiry')}
      onSubmit={async (payload) => {
        await create.mutateAsync({
          ...payload,
          assigned_to: payload.assigned_to || null,
        });
        navigate('/enquiry');
      }}
    />
  );
}
