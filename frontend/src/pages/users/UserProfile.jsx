import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BloodtypeOutlinedIcon from '@mui/icons-material/BloodtypeOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import { useUser } from '../../hooks/queries/useUsers';
import { usePermission } from '../../hooks/usePermission';
import { resolveMediaUrl } from '../../utils/constants';

const InfoTile = ({ icon: Icon, label, value, children }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      height: '100%',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(21,34,56,0.08)',
        transform: 'translateY(-1px)',
      },
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(33,150,243,0.1)',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Box minWidth={0}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.35 }}>
          {label}
        </Typography>
        {children || (
          <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
            {value || '—'}
          </Typography>
        )}
      </Box>
    </Stack>
  </Box>
);

const SectionCard = ({ title, children }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ px: 2.5, py: 1.75, bgcolor: 'rgba(33,150,243,0.04)' }}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
    </Box>
    <Divider />
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Card>
);

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canEdit = usePermission('users.edit');
  const { data, isLoading } = useUser(id);

  if (isLoading) return <Loader message="Loading employee profile..." />;

  if (!data) {
    return (
      <Box>
        <PageHeader title="Employee Profile" subtitle="Record not found" />
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </Box>
    );
  }

  const displayName =
    [data.first_name, data.last_name].filter(Boolean).join(' ') ||
    data.name ||
    'Employee';
  const photoUrl = resolveMediaUrl(data.avatar);
  const roleName = data.role?.name || data.role_name || '—';
  const branchName = data.branch?.name || data.branch_name || '—';
  const departmentName = data.department?.department_name || '—';
  const designationName = data.designation?.designation_name || '—';
  const hasWorkExperience = data.has_work_experience === true;

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Employee Profile"
        subtitle="Complete employee information"
        breadcrumbs={[
          { label: 'Users', to: '/users' },
          { label: displayName },
        ]}
        actionLabel={canEdit ? 'Edit User' : undefined}
        actionPermission={canEdit}
        onAction={() => navigate(`/users/edit/${id}`)}
      />

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 55%, #90caf9 100%)',
          color: '#fff',
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
          >
            <Avatar
              src={photoUrl || undefined}
              alt={displayName}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid rgba(255,255,255,0.85)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {photoUrl ? null : (
                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 56, opacity: 0.95 }} />
              )}
            </Avatar>

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                {displayName}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.92, mb: 1.5 }}>
                {designationName !== '—' ? designationName : roleName}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <Chip
                  label={roleName}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={branchName}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
                <Box sx={{ '& .MuiChip-root': { bgcolor: 'rgba(255,255,255,0.95)' } }}>
                  <StatusBadge status={data.is_active === false ? 'inactive' : 'active'} />
                </Box>
              </Stack>
            </Box>

            {!photoUrl && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  border: '1px dashed rgba(255,255,255,0.45)',
                }}
              >
                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 36, opacity: 0.85 }} />
              </Box>
            )}
          </Stack>
        </Box>
      </Card>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Contact & Work">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoTile icon={EmailOutlinedIcon} label="Email" value={data.email} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoTile icon={PhoneOutlinedIcon} label="Phone">
                    <ContactNumberDisplay
                      value={data.phone}
                      variant="phone"
                      typographyVariant="body2"
                      fontWeight={600}
                    />
                  </InfoTile>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoTile icon={WorkOutlineOutlinedIcon} label="Department" value={departmentName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoTile icon={BusinessCenterOutlinedIcon} label="Designation" value={designationName} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Personal Details">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoTile icon={BadgeOutlinedIcon} label="Gender" value={data.gender} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoTile icon={BloodtypeOutlinedIcon} label="Blood Group" value={data.blood_group} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoTile icon={BadgeOutlinedIcon} label="Aadhar Number" value={data.aadhar} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoTile icon={LocationOnOutlinedIcon} label="Permanent Address" value={data.permanent_address} />
                </Grid>
              </Grid>
            </SectionCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Work Experience">
            {hasWorkExperience ? (
              <Stack spacing={2}>
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: 'rgba(76,175,80,0.08)',
                    border: '1px solid rgba(76,175,80,0.2)',
                  }}
                >
                  <Typography variant="body2" fontWeight={700} color="success.dark">
                    Prior experience: Yes
                    {data.work_experience_years != null && data.work_experience_years !== ''
                      ? ` · ${data.work_experience_years} year(s)`
                      : ''}
                  </Typography>
                </Box>
                <InfoTile
                  icon={BusinessCenterOutlinedIcon}
                  label="Previous Company"
                  value={data.previous_company_name}
                />
                <InfoTile
                  icon={WorkOutlineOutlinedIcon}
                  label="Previous Designation"
                  value={data.previous_company_designation}
                />
                <InfoTile
                  icon={WorkOutlineOutlinedIcon}
                  label="Duration"
                  value={data.previous_company_duration}
                />
              </Stack>
            ) : (
              <Box
                sx={{
                  py: 3,
                  px: 2,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'rgba(21,34,56,0.03)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No prior work experience recorded.
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </Box>
    </Box>
  );
}
