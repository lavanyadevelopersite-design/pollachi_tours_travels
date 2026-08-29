import { useAuthStore } from '../store/authStore';
import { hasPermission, hasAllPermissions } from '../utils/permissions';

const isSuperAdmin = (user) =>
  user?.role_code === 'super_admin' || user?.role?.code === 'super_admin';

export const canSkipLeadStatusStages = (user) => {
  const code = String(user?.role_code || user?.role?.code || '').toLowerCase();
  return code === 'super_admin' || code === 'system_admin';
};

export const usePermission = (permission) => {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  if (isSuperAdmin(user)) return true;
  return hasPermission(permissions, permission);
};

export const usePermissions = () => {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const superAdmin = isSuperAdmin(user);

  return {
    permissions,
    can: (permission) => (superAdmin ? true : hasPermission(permissions, permission)),
    canAll: (list) => (superAdmin ? true : hasAllPermissions(permissions, list)),
  };
};

export default usePermission;
