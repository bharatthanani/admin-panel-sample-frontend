import { useAuthStore } from '@/stores/auth';

export const vRole = {
  mounted(el, binding) {
    const auth = useAuthStore();
    if (!auth.hasRole(binding.value)) {
      el.style.display = 'none';
    }
  },
};