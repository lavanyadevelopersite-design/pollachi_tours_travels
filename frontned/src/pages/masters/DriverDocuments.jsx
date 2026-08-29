import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { activeStatus, mapDriverProofsFromApi } from '../../schemas/master.schema';
import { resolveMediaUrl } from '../../utils/constants';
import OwnershipTag from '../../components/common/OwnershipTag';

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

const DocumentThumb = ({ url }) => {
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
          width: 120,
          height: 120,
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          display: 'block',
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        title="Open document"
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
      Open document
    </Button>
  );
};

export default function DriverDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canEdit = usePermission('drivers.edit');
  const { data, isLoading } = useEntityQuery('drivers', masterService.drivers, id);

  if (isLoading) return <Loader message="Loading driver documents..." />;
  if (!data) {
    return (
      <Box>
        <PageHeader title="Driver Documents" subtitle="Record not found" />
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/masters/drivers')}>
          Back to Drivers
        </Button>
      </Box>
    );
  }

  const photo = resolveMediaUrl(data.photo);
  const proofs = mapDriverProofsFromApi(data).filter(
    (p) => p.proofType || p.proofNumber || (p.existingImages || []).length
  );

  return (
    <Box>
      <PageHeader
        title="Driver Documents"
        subtitle={`${data.full_name || 'Driver'} · ${data.code || '—'}`}
        breadcrumbs={[
          { label: 'Masters', to: '/masters/drivers' },
          { label: 'Drivers', to: '/masters/drivers' },
          { label: 'Documents' },
        ]}
        actionLabel={canEdit ? 'Edit Driver' : undefined}
        actionPermission={canEdit}
        onAction={() => navigate(`/masters/drivers/edit/${id}`)}
        extra={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/masters/drivers')}
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
                  <Box sx={{ mt: 0.4 }}>
                    <OwnershipTag record={data} />
                  </Box>
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
                <InfoItem label="License No" value={data.license_number} />
                <InfoItem label="License Type" value={data.license_type} />
                <InfoItem label="License Expiry" value={formatDate(data.license_expiry)} />
                <InfoItem
                  label="Availability"
                  value={(data.availability_status || '—')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                />
              </Stack>
              {canEdit && (
                <Button
                  fullWidth
                  sx={{ mt: 2 }}
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/masters/drivers/edit/${id}`)}
                >
                  Edit Driver
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Proof Documents
              </Typography>
              {!proofs.length ? (
                <Typography color="text.secondary">No proof documents uploaded.</Typography>
              ) : (
                <Stack spacing={2}>
                  {proofs.map((proof, index) => (
                    <Box
                      key={proof.id || index}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={1}
                        mb={1.5}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {proof.proofType || `Proof ${index + 1}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            No: {proof.proofNumber || '—'}
                            {proof.licenseType ? ` · ${proof.licenseType}` : ''}
                            {proof.expiryDate ? ` · Exp: ${formatDate(proof.expiryDate)}` : ''}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`${(proof.existingImages || []).length} file(s)`}
                          variant="outlined"
                        />
                      </Stack>
                      {proof.notes && (
                        <Typography variant="body2" color="text.secondary" mb={1.5}>
                          {proof.notes}
                        </Typography>
                      )}
                      {(proof.existingImages || []).length ? (
                        <Stack direction="row" flexWrap="wrap" gap={1.5}>
                          {proof.existingImages.map((url) => (
                            <DocumentThumb key={url} url={url} />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No images/documents for this proof.
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
