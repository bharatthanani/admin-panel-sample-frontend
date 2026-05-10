import { useAuthStore } from '@/stores/auth';

export const vPermission = {
  mounted(el, binding) {
    const auth     = useAuthStore();
    const required = binding.value;
    const perms    = Array.isArray(required) ? required : [required];

    // .all modifier → user must have EVERY permission
    // no modifier   → user needs AT LEAST ONE
    const hasAccess = binding.modifiers.all
      ? perms.every(p => auth.can(p))
      : perms.some(p  => auth.can(p));

    if (!hasAccess) {
      el.style.display = 'none';
    }
  },
};