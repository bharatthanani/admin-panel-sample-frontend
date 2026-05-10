import { useAuthStore } from '@/stores/auth';

export function usePermission() {
  const auth = useAuthStore();
  return {
    can:     (perm) => auth.can(perm),
    hasRole: (role) => auth.hasRole(role),
    isAdmin:  auth.isAdmin,
    isVendor: auth.isVendor,
    isUser:   auth.isUser,
  };
}