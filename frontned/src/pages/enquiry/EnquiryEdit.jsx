import { useNavigate, useParams } from 'react-router-dom';
import EnquiryForm from './EnquiryForm';
import Loader from '../../components/common/Loader';
import enquiryService from '../../services/enquiry.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { useEnquiryMutation } from '../../hooks/queries/useEnquiry';

export default function EnquiryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useEntityQuery('enquiries', enquiryService, id);
  const { update } = useEnquiryMutation();

  if (isLoading) return <Loader message="Loading enquiry..." />;

  return (
    <EnquiryForm
      mode="edit"
      initialData={data}
      loading={update.isPending}
      onCancel={() => navigate('/enquiry')}
      onRefresh={() => refetch()}
      onSubmit={async (payload) => {
        await update.mutateAsync({ id, ...payload });
        navigate('/enquiry');
      }}
    />
  );
}
