import { useEffect, useState } from 'react';
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/common/PageHeader';
import FormTextField from '../../components/forms/FormTextField';
import FormPasswordField from '../../components/forms/FormPasswordField';
import FormSwitch from '../../components/forms/FormSwitch';
import SectionHeading from '../../components/forms/layout/SectionHeading';
import { useAuth } from '../../hooks/useAuth';
import { useBranding, useInvalidateBranding } from '../../hooks/queries/useBranding';
import { settingsService } from '../../services/common.service';
import authService from '../../services/auth.service';
import { changePasswordSchema, profileUpdateSchema } from '../../schemas/auth.schema';
import { resolveMediaUrl } from '../../utils/constants';

const settingsToMap = (rows = []) =>
  Object.fromEntries(rows.map((row) => [row.key, row.value]));

const mediaSrc = (path) => {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
};

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { data: branding } = useBranding();
  const invalidateBranding = useInvalidateBranding();
  const [logoUrl, setLogoUrl] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.first_name || user?.firstName || '',
      lastName: user?.last_name || user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const companyForm = useForm({
    defaultValues: {
      companyName: 'Pollachi Tours and Travels',
      address: '',
      phone: '',
      email: 'info@tourstravels.com',
      gstin: '',
      currency: 'INR',
      bankName: '',
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      invoiceNote: '',
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      firstName: user.first_name || user.firstName || user.name?.split(' ')?.[0] || '',
      lastName:
        user.last_name ||
        user.lastName ||
        user.name?.split(' ')?.slice(1).join(' ') ||
        '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user, profileForm]);

  useEffect(() => {
    if (branding?.company_logo) setLogoUrl(mediaSrc(branding.company_logo));
    if (branding?.digital_signature) setSignatureUrl(mediaSrc(branding.digital_signature));
    if (branding?.company_name) companyForm.setValue('companyName', branding.company_name);
    if (branding?.bank_name) companyForm.setValue('bankName', branding.bank_name);
    if (branding?.bank_account_name) companyForm.setValue('accountName', branding.bank_account_name);
    if (branding?.bank_account_number) {
      companyForm.setValue('accountNumber', branding.bank_account_number);
    }
    if (branding?.bank_ifsc) companyForm.setValue('ifscCode', branding.bank_ifsc);
    if (branding?.invoice_note != null) companyForm.setValue('invoiceNote', branding.invoice_note);
  }, [branding, companyForm]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await settingsService.get();
        const rows = Array.isArray(data?.data) ? data.data : [];
        const map = settingsToMap(rows);
        if (!active) return;
        if (map.company_name) companyForm.setValue('companyName', map.company_name);
        if (map.company_email) companyForm.setValue('email', map.company_email);
        if (map.company_phone) companyForm.setValue('phone', map.company_phone);
        if (map.company_address) companyForm.setValue('address', map.company_address);
        if (map.gstin) companyForm.setValue('gstin', map.gstin);
        if (map.currency) companyForm.setValue('currency', map.currency);
        if (map.bank_name) companyForm.setValue('bankName', map.bank_name);
        if (map.bank_account_name) companyForm.setValue('accountName', map.bank_account_name);
        if (map.bank_account_number) companyForm.setValue('accountNumber', map.bank_account_number);
        if (map.bank_ifsc) companyForm.setValue('ifscCode', map.bank_ifsc);
        if (map.invoice_note != null) companyForm.setValue('invoiceNote', map.invoice_note);
        if (map.company_logo) setLogoUrl(mediaSrc(map.company_logo));
        if (map.digital_signature) setSignatureUrl(mediaSrc(map.digital_signature));
      } catch {
        // branding query still covers logo/name for users without settings.view
      }
    })();
    return () => {
      active = false;
    };
  }, [companyForm]);

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please select an image file', { variant: 'warning' });
      return;
    }

    setUploadingLogo(true);
    try {
      const { data } = await settingsService.uploadLogo(file);
      const url = data?.data?.url || data?.data?.value;
      setLogoUrl(mediaSrc(url));
      await invalidateBranding();
      enqueueSnackbar('Logo updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Logo upload failed', { variant: 'error' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSignatureChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please select an image file', { variant: 'warning' });
      return;
    }

    setUploadingSignature(true);
    try {
      const { data } = await settingsService.uploadSignature(file);
      const url = data?.data?.url || data?.data?.value;
      setSignatureUrl(mediaSrc(url));
      await invalidateBranding();
      enqueueSnackbar('Digital signature updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Signature upload failed', {
        variant: 'error',
      });
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleProfileSave = async (values) => {
    setSavingProfile(true);
    try {
      const { data } = await authService.updateProfile({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone || null,
      });
      const updatedUser = data?.data || data;
      if (updatedUser) updateUser(updatedUser);
      if (values.phone) {
        await settingsService.update({
          settings: [{ key: 'company_phone', value: values.phone, group: 'general' }],
        });
        await invalidateBranding();
      }
      enqueueSnackbar('Profile updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to update profile', {
        variant: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (values) => {
    setSavingPassword(true);
    try {
      await authService.changePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      });
      passwordForm.reset();
      enqueueSnackbar('Password updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to update password', {
        variant: 'error',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCompanySave = async (values) => {
    setSavingCompany(true);
    try {
      await settingsService.update({
        settings: [
          { key: 'company_name', value: values.companyName, group: 'general' },
          { key: 'company_email', value: values.email, group: 'general' },
          { key: 'company_phone', value: values.phone, group: 'general' },
          { key: 'company_address', value: values.address, group: 'general' },
          { key: 'gstin', value: values.gstin, group: 'general' },
          { key: 'currency', value: values.currency, group: 'finance' },
          { key: 'bank_name', value: values.bankName, group: 'finance' },
          { key: 'bank_account_name', value: values.accountName, group: 'finance' },
          { key: 'bank_account_number', value: values.accountNumber, group: 'finance' },
          { key: 'bank_ifsc', value: values.ifscCode, group: 'finance' },
          { key: 'invoice_note', value: values.invoiceNote, group: 'finance' },
        ],
      });
      await invalidateBranding();
      enqueueSnackbar('Settings saved', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to save settings', {
        variant: 'error',
      });
    } finally {
      setSavingCompany(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Profile and company preferences" />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <SectionHeading>Profile</SectionHeading>
              <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
                <Stack spacing={2}>
                  <FormTextField
                    name="firstName"
                    control={profileForm.control}
                    label="First Name"
                  />
                  <FormTextField name="lastName" control={profileForm.control} label="Last Name" />
                  <FormTextField
                    name="email"
                    control={profileForm.control}
                    label="Username (Email)"
                    type="email"
                  />
                  <FormTextField name="phone" control={profileForm.control} label="Phone" />
                  <Button type="submit" variant="contained" disabled={savingProfile}>
                    {savingProfile ? 'Saving…' : 'Save Profile'}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 2.5 }} />

              <SectionHeading>Change Password</SectionHeading>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)}>
                <Stack spacing={2}>
                  <FormPasswordField
                    name="currentPassword"
                    control={passwordForm.control}
                    label="Current Password"
                    autoComplete="current-password"
                  />
                  <FormPasswordField
                    name="newPassword"
                    control={passwordForm.control}
                    label="New Password"
                    autoComplete="new-password"
                  />
                  <FormPasswordField
                    name="confirmPassword"
                    control={passwordForm.control}
                    label="Confirm New Password"
                    autoComplete="new-password"
                  />
                  <Button type="submit" variant="contained" disabled={savingPassword}>
                    {savingPassword ? 'Updating…' : 'Update Password'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <SectionHeading>Company</SectionHeading>
              <form onSubmit={companyForm.handleSubmit(handleCompanySave)}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} mb={1}>
                      Company Logo
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        variant="rounded"
                        src={logoUrl || undefined}
                        alt="Company logo"
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: 'primary.main',
                          fontSize: 14,
                        }}
                      >
                        Logo
                      </Avatar>
                      <Box>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          disabled={uploadingLogo}
                          sx={{ borderStyle: 'dashed' }}
                        >
                          {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
                          <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleLogoChange}
                          />
                        </Button>
                        <Typography variant="caption" display="block" mt={0.75} color="text.secondary">
                          PNG, JPG, GIF or WebP. Applied logo appears in the sidebar.
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  <Divider />
                  <FormTextField name="companyName" control={companyForm.control} label="Company Name" />
                  <FormTextField name="email" control={companyForm.control} label="Support Email" />
                  <FormTextField name="phone" control={companyForm.control} label="Phone" />
                  <FormTextField name="gstin" control={companyForm.control} label="GSTIN" />
                  <FormTextField
                    name="address"
                    control={companyForm.control}
                    label="Address"
                    multiline
                    rows={2}
                  />

                  <Divider />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Bank Details
                  </Typography>
                  <FormTextField name="bankName" control={companyForm.control} label="Bank Name" />
                  <FormTextField
                    name="accountName"
                    control={companyForm.control}
                    label="Account Name"
                  />
                  <FormTextField
                    name="accountNumber"
                    control={companyForm.control}
                    label="Account Number"
                  />
                  <FormTextField name="ifscCode" control={companyForm.control} label="IFSC Code" />

                  <Divider />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Invoice Note
                  </Typography>
                  <FormTextField
                    name="invoiceNote"
                    control={companyForm.control}
                    label="Invoice Note"
                    multiline
                    rows={4}
                    placeholder="Notes shown in the invoice Notes section (one line per note)"
                  />

                  <Divider />
                  <Box>
                    <Typography variant="body2" fontWeight={500} mb={1}>
                      Digital Signature
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 120,
                          height: 64,
                          borderRadius: 1,
                          border: '1px dashed',
                          borderColor: 'divider',
                          bgcolor: '#f8fafc',
                          backgroundImage: signatureUrl ? `url(${signatureUrl})` : 'none',
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {!signatureUrl && (
                          <Typography variant="caption" color="text.secondary">
                            No signature
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          disabled={uploadingSignature}
                          sx={{ borderStyle: 'dashed' }}
                        >
                          {uploadingSignature ? 'Uploading…' : 'Upload Signature'}
                          <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleSignatureChange}
                          />
                        </Button>
                        <Typography variant="caption" display="block" mt={0.75} color="text.secondary">
                          Shown on quotation and invoice as authorised signatory.
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider />
                  <FormSwitch
                    name="emailNotifications"
                    control={companyForm.control}
                    label="Email notifications"
                  />
                  <FormSwitch
                    name="smsNotifications"
                    control={companyForm.control}
                    label="SMS notifications"
                  />
                  <Button type="submit" variant="contained" disabled={savingCompany}>
                    {savingCompany ? 'Saving…' : 'Save Settings'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
