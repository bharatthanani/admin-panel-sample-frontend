// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  
  // ── State ──
  const user        = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const token       = ref(localStorage.getItem('admin_token') || null);
  const permissions = ref(JSON.parse(localStorage.getItem('permissions') || '[]'));
  const role        = ref(localStorage.getItem('role') || null);
   
  // ── Computed ──
  const isLoggedIn  = computed(() => !!token.value);
  const isAdmin     = computed(() => role.value === 'admin');
  const isVendor    = computed(() => role.value === 'vendor');
  const isUser      = computed(() => role.value === 'user');

  // ── Permission checker ──
  const can = (permission) => permissions.value.includes(permission);
  const hasRole = (r) => role.value === r;

  // ── Login ──
  const login = async (credentials) => {
    const res = await axios.post('/api/login', credentials);
    const data = res.data;
    alert("Working");
    token.value       = data.token;
    user.value        = data.user;
    role.value        = data.user.role;
    permissions.value = data.user.permissions;

    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('user',        JSON.stringify(data.user));
    localStorage.setItem('role',        data.user.role);
    localStorage.setItem('permissions', JSON.stringify(data.user.permissions));

    // Set default auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    console.log('Login successful show:', data);
    return data;
  };

  // ── Logout ──
  const logout = () => {
    token.value       = null;
    user.value        = null;
    role.value        = null;
    permissions.value = [];
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
    delete axios.defaults.headers.common['Authorization'];
  };

  // ── Refresh permissions from server ──
  const refreshPermissions = async () => {
    try {
      const res = await axios.get('/api/me/permissions');
      role.value        = res.data.role;
      permissions.value = res.data.permissions;
      localStorage.setItem('role',        res.data.role);
      localStorage.setItem('permissions', JSON.stringify(res.data.permissions));
    } catch (e) {
      console.error('Failed to refresh permissions', e);
    }
  };

  // ── Init axios header on app boot ──
  const init = () => {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }
  };

  return {
    user, token, permissions, role,
    isLoggedIn, isAdmin, isVendor, isUser,
    can, hasRole,
    login, logout, refreshPermissions, init,
  };
});