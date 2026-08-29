import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckIcon from '@mui/icons-material/Check';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import SelectFilter, { ACTIVE_STATUS_OPTIONS } from '../../components/common/SelectFilter';
import { usePermission } from '../../hooks/usePermission';
import {
  usePermissionsCatalog,
  useRoleMutation,
  useRoles,
} from '../../hooks/queries/useRoles';
import RoleFormDialog from './RoleFormDialog';

const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'];

const ACTION_LABELS = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
  export: 'Export',
  print: 'Print',
};

const formatModule = (module = '') =>
  module
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getRoleIcon = (role) => {
  const code = (role?.code || role?.name || '').toLowerCase();
  if (code.includes('super') || code.includes('admin')) return AdminPanelSettingsIcon;
  if (code.includes('manager')) return GroupsIcon;
  if (code.includes('support') || code.includes('agent')) return SupportAgentIcon;
  if (code.includes('finance') || code.includes('account')) return AttachMoneyIcon;
  if (code.includes('read') || code.includes('viewer')) return VisibilityOffIcon;
  if (code.includes('sales')) return PersonIcon;
  return BadgeIcon;
};

const PermissionToggle = ({ checked, disabled, onChange }) => (
  <Switch
    checked={checked}
    disabled={disabled}
    onChange={onChange}
    size="small"
    icon={
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          bgcolor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    }
    checkedIcon={
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          bgcolor: '#fff',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        <CheckIcon sx={{ fontSize: 12, color: 'primary.main' }} />
      </Box>
    }
    sx={{
      width: 42,
      height: 26,
      padding: 0,
      '& .MuiSwitch-switchBase': {
        padding: '4px',
        '&.Mui-checked': {
          transform: 'translateX(16px)',
          color: '#fff',
          '& + .MuiSwitch-track': {
            bgcolor: 'primary.main',
            opacity: 1,
          },
        },
      },
      '& .MuiSwitch-thumb': {
        width: 18,
        height: 18,
        boxShadow: 'none',
        bgcolor: 'transparent',
      },
      '& .MuiSwitch-track': {
        borderRadius: 13,
        bgcolor: '#e2e8f0',
        opacity: 1,
      },
    }}
  />
);

const actionBtnSx = {
  borderRadius: 2.5,
  px: 2,
  py: 0.85,
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: 'none',
  minHeight: 38,
};

export default function RoleList() {
  const canCreate = usePermission('roles.create');
  const canEdit = usePermission('roles.edit');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [dirty, setDirty] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: 1,
    perPage: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const { data: permissions = [], isLoading: permsLoading } = usePermissionsCatalog();
  const { create, update } = useRoleMutation();

  const roles = useMemo(
    () => (rolesData?.rows || []).filter((r) => r.code !== 'super_admin'),
    [rolesData]
  );

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roles.filter((r) => {
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && r.is_active !== false) ||
        (statusFilter === 'inactive' && r.is_active === false);
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        r.name?.toLowerCase().includes(q) ||
        r.code?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    });
  }, [roles, search, statusFilter]);

  useEffect(() => {
    if (!selectedRoleId && filteredRoles.length) {
      setSelectedRoleId(filteredRoles[0].id);
    } else if (
      selectedRoleId &&
      filteredRoles.length &&
      !filteredRoles.some((r) => r.id === selectedRoleId)
    ) {
      setSelectedRoleId(filteredRoles[0].id);
    }
  }, [filteredRoles, selectedRoleId]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const isSuperAdmin = selectedRole?.code === 'super_admin';
  const readOnly = !canEdit || isSuperAdmin;

  useEffect(() => {
    if (!selectedRole) {
      setSelectedIds(new Set());
      setDirty(false);
      return;
    }
    const ids = new Set((selectedRole.permissions || []).map((p) => p.id));
    setSelectedIds(ids);
    setDirty(false);
  }, [selectedRole]);

  const permissionsByModule = useMemo(() => {
    const map = {};
    permissions.forEach((perm) => {
      if (!map[perm.module]) map[perm.module] = {};
      map[perm.module][perm.action] = perm;
    });
    return map;
  }, [permissions]);

  const modules = useMemo(
    () => Object.keys(permissionsByModule).sort(),
    [permissionsByModule]
  );

  const togglePermission = useCallback(
    (permissionId) => {
      if (readOnly || !permissionId) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(permissionId)) next.delete(permissionId);
        else next.add(permissionId);
        return next;
      });
      setDirty(true);
    },
    [readOnly]
  );

  const toggleModuleAll = useCallback(
    (module, checked) => {
      if (readOnly) return;
      const modulePerms = Object.values(permissionsByModule[module] || {});
      setSelectedIds((prev) => {
        const next = new Set(prev);
        modulePerms.forEach((p) => {
          if (checked) next.add(p.id);
          else next.delete(p.id);
        });
        return next;
      });
      setDirty(true);
    },
    [permissionsByModule, readOnly]
  );

  const toggleActionColumn = useCallback(
    (action, checked) => {
      if (readOnly) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        modules.forEach((module) => {
          const perm = permissionsByModule[module]?.[action];
          if (!perm) return;
          if (checked) next.add(perm.id);
          else next.delete(perm.id);
        });
        return next;
      });
      setDirty(true);
    },
    [modules, permissionsByModule, readOnly]
  );

  const selectAllVisible = useCallback(
    (checked) => {
      if (readOnly) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        modules.forEach((module) => {
          Object.values(permissionsByModule[module] || {}).forEach((p) => {
            if (checked) next.add(p.id);
            else next.delete(p.id);
          });
        });
        return next;
      });
      setDirty(true);
    },
    [modules, permissionsByModule, readOnly]
  );

  const handleSavePermissions = async () => {
    if (!selectedRole || readOnly) return;
    await update.mutateAsync({
      id: selectedRole.id,
      permission_ids: Array.from(selectedIds),
    });
    setDirty(false);
  };

  const handleFormSubmit = async (values) => {
    const { data: res } = await create.mutateAsync({
      name: values.name,
      code: values.code,
      description: values.description,
      permission_ids: [],
    });
    const created = res?.data || res;
    if (created?.id) setSelectedRoleId(created.id);
    setFormOpen(false);
  };

  if ((rolesLoading || permsLoading) && !roles.length) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Select a role and manage its access permissions"
        extra={
          <TextField
            size="small"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 240 },
              '& .MuiOutlinedInput-root': {
                height: 42,
                borderRadius: 2.5,
                bgcolor: '#fff',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        }
        action={
          canCreate ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
              sx={{
                height: 42,
                px: 2.5,
                borderRadius: 2.5,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                bgcolor: '#2196f3',
                boxShadow: '0 4px 14px rgba(33,150,243,0.3)',
                '&:hover': {
                  bgcolor: '#1976d2',
                  boxShadow: '0 6px 18px rgba(33,150,243,0.35)',
                },
              }}
            >
              Add Role
            </Button>
          ) : null
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: 2.5,
          alignItems: 'stretch',
          minHeight: 520,
        }}
      >
        {/* Role List */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
          }}
        >
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Role List
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.25 }}>
              {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''}
            </Typography>
            <SelectFilter
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={ACTIVE_STATUS_OPTIONS}
              fullWidth
              minWidth={0}
            />
          </Box>

          {filteredRoles.length === 0 ? (
            <EmptyState
              title="No roles found"
              description="Create a role to start assigning permissions."
              actionLabel={canCreate ? 'Add Role' : undefined}
              onAction={canCreate ? () => setFormOpen(true) : undefined}
            />
          ) : (
            <List disablePadding sx={{ flex: 1, overflow: 'auto' }}>
              {filteredRoles.map((role, index) => {
                const Icon = getRoleIcon(role);
                const selected = role.id === selectedRoleId;
                return (
                  <Box key={role.id}>
                    <ListItemButton
                      selected={selected}
                      onClick={() => setSelectedRoleId(role.id)}
                      sx={{
                        px: 2.5,
                        py: 1.75,
                        '&.Mui-selected': {
                          bgcolor: 'rgba(33, 150, 243, 0.08)',
                          borderRight: '3px solid',
                          borderColor: 'primary.main',
                          '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.12)' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 44 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: selected ? 'rgba(33, 150, 243, 0.15)' : 'rgba(148,163,184,0.15)',
                            color: selected ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          <Icon sx={{ fontSize: 20 }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography fontWeight={selected ? 700 : 600} fontSize={14}>
                            {role.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {role.code}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    {index < filteredRoles.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          )}
        </Paper>

        {/* Permissions Matrix */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
              px: 2.5,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ flexShrink: 0 }}>
              Permissions
            </Typography>

            {selectedRole && canEdit && !isSuperAdmin && (
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                flexWrap="nowrap"
                sx={{ ml: 'auto', flexShrink: 0 }}
              >
                <Button
                  size="small"
                  startIcon={<DoneAllIcon />}
                  onClick={() => selectAllVisible(true)}
                  disabled={readOnly}
                  sx={{
                    ...actionBtnSx,
                    color: '#15803d',
                    bgcolor: '#dcfce7',
                    border: '1px solid #86efac',
                    '&:hover': { bgcolor: '#bbf7d0', boxShadow: 'none' },
                    '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0' },
                  }}
                >
                  Select all
                </Button>
                <Button
                  size="small"
                  startIcon={<ClearAllIcon />}
                  onClick={() => selectAllVisible(false)}
                  disabled={readOnly}
                  sx={{
                    ...actionBtnSx,
                    color: '#c2410c',
                    bgcolor: '#ffedd5',
                    border: '1px solid #fdba74',
                    '&:hover': { bgcolor: '#fed7aa', boxShadow: 'none' },
                    '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0' },
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  disabled={!dirty || update.isPending}
                  onClick={handleSavePermissions}
                  sx={{
                    ...actionBtnSx,
                    bgcolor: '#2196f3',
                    color: '#fff',
                    px: 2.5,
                    boxShadow: '0 4px 12px rgba(33,150,243,0.35)',
                    '&:hover': {
                      bgcolor: '#1976d2',
                      boxShadow: '0 6px 16px rgba(33,150,243,0.4)',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#bfdbfe',
                      color: '#fff',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {update.isPending ? 'Saving…' : 'Save'}
                </Button>
              </Stack>
            )}
          </Box>

          {!selectedRole ? (
            <EmptyState title="Select a role" description="Choose a role from the list to view and edit permissions." />
          ) : (
            <Box sx={{ overflow: 'auto', flex: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `minmax(160px, 1.4fr) repeat(${ACTIONS.length}, minmax(72px, 1fr))`,
                  minWidth: 720,
                  alignItems: 'center',
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    bgcolor: '#f8fafc',
                    px: 2.5,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    fontWeight: 700,
                    fontSize: 13,
                    color: 'text.secondary',
                  }}
                >
                  Module
                </Box>
                {ACTIONS.map((action) => {
                  const allOn = modules.every((m) => {
                    const perm = permissionsByModule[m]?.[action];
                    return !perm || selectedIds.has(perm.id);
                  });
                  const someOn =
                    !allOn &&
                    modules.some((m) => {
                      const perm = permissionsByModule[m]?.[action];
                      return perm && selectedIds.has(perm.id);
                    });
                  return (
                    <Box
                      key={action}
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        bgcolor: '#f8fafc',
                        px: 1,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.25 }}
                      >
                        {ACTION_LABELS[action]}
                      </Typography>
                      {!readOnly && (
                        <Checkbox
                          size="small"
                          checked={allOn && modules.length > 0}
                          indeterminate={someOn}
                          onChange={(e) => toggleActionColumn(action, e.target.checked)}
                          sx={{ p: 0.25 }}
                        />
                      )}
                    </Box>
                  );
                })}

                {/* Rows */}
                {modules.map((module, rowIndex) => {
                  const modulePerms = Object.values(permissionsByModule[module] || {});
                  const allModuleOn =
                    modulePerms.length > 0 && modulePerms.every((p) => selectedIds.has(p.id));
                  const someModuleOn =
                    !allModuleOn && modulePerms.some((p) => selectedIds.has(p.id));

                  return (
                    <Box key={module} sx={{ display: 'contents' }}>
                      <Box
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: rowIndex % 2 ? 'rgba(248,250,252,0.6)' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {!readOnly && (
                          <Checkbox
                            size="small"
                            checked={allModuleOn}
                            indeterminate={someModuleOn}
                            onChange={(e) => toggleModuleAll(module, e.target.checked)}
                            sx={{ p: 0.25 }}
                          />
                        )}
                        <Typography fontWeight={600} fontSize={13.5}>
                          {formatModule(module)}
                        </Typography>
                      </Box>
                      {ACTIONS.map((action) => {
                        const perm = permissionsByModule[module]?.[action];
                        return (
                          <Box
                            key={`${module}-${action}`}
                            sx={{
                              px: 1,
                              py: 1.25,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              bgcolor: rowIndex % 2 ? 'rgba(248,250,252,0.6)' : '#fff',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {perm ? (
                              <PermissionToggle
                                checked={isSuperAdmin || selectedIds.has(perm.id)}
                                disabled={readOnly}
                                onChange={() => togglePermission(perm.id)}
                              />
                            ) : (
                              <Typography variant="caption" color="text.disabled">
                                —
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>

              {modules.length === 0 && (
                <EmptyState
                  title="No modules match"
                  description="Try a different filter to find permission modules."
                />
              )}
            </Box>
          )}

          {isSuperAdmin && (
            <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'rgba(34,197,94,0.08)', borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Super Admin always has full access. Permission toggles cannot be changed for this role.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <RoleFormDialog
        open={formOpen}
        loading={create.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
}
