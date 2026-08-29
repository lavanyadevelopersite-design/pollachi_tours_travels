import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import Loader from '../../components/common/Loader';
import WhatsAppTemplateDialog from '../../components/whatsapp/WhatsAppTemplateDialog';
import {
  useWhatsAppTemplateMutation,
  useWhatsAppTemplateRows,
} from '../../hooks/queries/useWhatsAppTemplates';
import { usePermission } from '../../hooks/usePermission';

export default function WhatsAppTemplateList() {
  const canEdit = usePermission('lead_statuses.edit');
  const { data: rows = [], isLoading } = useWhatsAppTemplateRows();
  const { create, update, updateStatus } = useWhatsAppTemplateMutation();
  const [dialogTemplate, setDialogTemplate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return rows;
    if (statusFilter === 'active') {
      return rows.filter((row) => row.is_active);
    }
    if (statusFilter === 'inactive') {
      return rows.filter((row) => !row.is_active);
    }
    return rows;
  }, [rows, statusFilter]);

  const columns = useMemo(
    () => [
      {
        id: 'sno',
        name: 'S.No',
        width: '70px',
        selector: (_row, index) => index + 1,
      },
      {
        id: 'template_name',
        name: 'Template Name',
        grow: 1.5,
        cell: (row) => (
          <Typography fontWeight={700}>{row.template_name || '—'}</Typography>
        ),
      },
      {
        id: 'status',
        name: 'Status',
        width: '160px',
        cell: (row) => {
          const isActive = row.is_active !== false;

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={isActive ? 'Active' : 'Inactive'}
                color={isActive ? 'success' : 'default'}
                sx={{ fontWeight: 700 }}
              />
              {canEdit ? (
                <Switch
                  size="small"
                  checked={isActive}
                  onChange={() =>
                    updateStatus.mutate({
                      id: row.id,
                      is_active: !isActive,
                    })
                  }
                  disabled={updateStatus.isPending}
                />
              ) : null}
            </Stack>
          );
        },
      },
      {
        id: 'actions',
        name: 'Actions',
        width: '80px',
        cell: (row) =>
          canEdit ? (
            <Tooltip title="Edit template">
              <IconButton size="small" onClick={() => setDialogTemplate(row)}>
                <EditOutlinedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            '—'
          ),
      },
    ],
    [canEdit, updateStatus]
  );

  if (isLoading) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="WhatsApp Template Structure"
        subtitle="Manage WhatsApp message templates. Only active templates are used when sending messages."
        actionLabel={canEdit ? 'Add Template' : undefined}
        actionPermission={canEdit}
        onAction={() => setDialogTemplate({})}
        extra={
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter status</InputLabel>
            <Select
              label="Filter status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active only</MenuItem>
              <MenuItem value="inactive">Inactive only</MenuItem>
            </Select>
          </FormControl>
        }
      />

      <DataTable
        columns={columns}
        data={filteredRows}
        totalRows={filteredRows.length}
        page={1}
        perPage={Math.max(filteredRows.length, 10)}
        paginationServer={false}
        searchable={false}
        exportable={false}
        tableKey="whatsapp-templates"
      />

      <WhatsAppTemplateDialog
        open={Boolean(dialogTemplate)}
        template={dialogTemplate}
        saving={create.isPending || update.isPending}
        onClose={() => setDialogTemplate(null)}
        onSave={(payload) => {
          const isEdit = Boolean(dialogTemplate?.id);
          const mutation = isEdit ? update : create;
          mutation.mutate(
            isEdit ? { id: dialogTemplate.id, ...payload } : payload,
            { onSuccess: () => setDialogTemplate(null) }
          );
        }}
      />
    </Box>
  );
}
