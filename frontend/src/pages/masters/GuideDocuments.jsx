import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import masterService from '../../services/master.service';
import { useEntityQuery } from '../../hooks/queries/useEntityQuery';
import { usePermission } from '../../hooks/usePermission';
import { activeStatus } from '../../schemas/master.schema';
import { resolveMediaUrl } from '../../utils/constants';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const InfoItem = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500}>
      {value || '—'}
    </Typography>
  </Box>
);

const DocumentThumb = ({ url, label = 'Open document' }) => {
  const src = resolveMediaUrl(url);
  if (!src) return null;
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);

  if (isImage) {
    return (
      <Box
        component="a"
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          width: 160,
          height: 160,
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          display: 'block',
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        title={label}
      />
    );
  }

  return (
    <Button
      component="a"
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      variant="outlined"
      startIcon={<InsertDriveFileOutlinedIcon />}
      sx={{ textTransform: 'none' }}
    >
      {label}
    </Button>
  );
};

export default function GuideDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canEdit = usePermission('guides.edit');
  const { data, isLoading } = useEntityQuery('guides', masterService.guides, id);

  if (isLoading) return <Loader message="Loading guide documents..." />;
  if (!data) {
    return (
      <Box>
        <PageHeader title="Guide Documents" subtitle="Record not found" />
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/masters/guides')}>
          Back to Guides
        </Button>
      </Box>
    );
  }

  const photo = resolveMediaUrl(data.photo);
  const proofDocument = resolveMediaUrl(data.proof_document);

  return (
    <Box>
      <PageHeader
        title="Guide Documents"
        subtitle={`${data.full_name || 'Guide'} · ${data.code || '—'}`}
        breadcrumbs={[
          { label: 'Masters', to: '/masters/guides' },
          { label: 'Guide Info', to: '/masters/guides' },
          { label: 'Documents' },
        ]}
        actionLabel={canEdit ? 'Edit Guide' : undefined}
        actionPermission={canEdit}
        onAction={() => navigate(`/masters/guides/edit/${id}`)}
        extra={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/masters/guides')}
          >
            Back
          </Button>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar src={photo || undefined} alt={data.full_name} sx={{ width: 72, height: 72 }}>
                  {(data.full_name || '?').charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {data.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.code}
                  </Typography>
                  <Box mt={0.5}>
                    <StatusBadge status={activeStatus(data)} />
                  </Box>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                <InfoItem label="Phone" value={data.phone} />
                <InfoItem label="WhatsApp" value={data.whatsapp} />
                <InfoItem label="Emergency Phone" value={data.emergency_phone} />
                <InfoItem label="Languages" value={data.languages} />
                <InfoItem label="Coverage Areas" value={data.coverage_areas} />
              </Stack>
              {canEdit && (
                <Button
                  fullWidth
                  sx={{ mt: 2 }}
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/masters/guides/edit/${id}`)}
                >
                  Edit Guide
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Profile Photo
                </Typography>
                {photo ? (
                  <DocumentThumb url={data.photo} label="Open photo" />
                ) : (
                  <Typography color="text.secondary">No profile photo uploaded.</Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  License & ID Proof
                </Typography>
                <Grid container spacing={2} mb={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label="Guide License No" value={data.license_number} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label="License Expiry" value={formatDate(data.license_expiry)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label="ID Proof Type" value={data.id_proof_type} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label="ID Proof Number" value={data.id_proof_number} />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
                  Proof Document
                </Typography>
                {proofDocument ? (
                  <DocumentThumb url={data.proof_document} label="Open proof document" />
                ) : (
                  <Typography color="text.secondary">No proof document uploaded.</Typography>
                )}
              </CardContent>
            </Card>

            {data.bio && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={1}>
                    Bio (Tourist Source)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.bio}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
