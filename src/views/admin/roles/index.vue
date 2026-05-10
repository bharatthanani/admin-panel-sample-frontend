<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import PremiumLoader from '@/components/PremiumLoader.vue';
import axios from 'axios';
import { ClientService } from '@/services';

const toast = useToast();

/* ── State ── */
const roles            = ref([]);
const users            = ref([]);
const groupedPermissions = ref({});
const isLoading        = ref(false);
const loadingText      = ref('Loading');
const search           = ref('');
const showModal        = ref(false);
const editingRole      = ref(null);
const selectedPerms    = ref([]);

/* ── Computed ── */
const filteredUsers = computed(() => {
  const q = search.value.toLowerCase();
  return users.value
    .filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .map(u => ({ ...u, selectedRole: u.selectedRole || u.role }));
});
const totalUsers       = computed(() => roles.value.reduce((s, r) => s + r.users_count, 0));
const totalPermissions = computed(() => Object.values(groupedPermissions.value).flat().length);

/* ── Helpers ── */
const capitalize  = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const initials    = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
const avatarBg    = (role) => ({ admin:'#eef0fd', vendor:'#fffbeb', user:'#ecfdf5' }[role] || '#f5f5f3');
const permGroup   = (perm) => {
  const g = perm.split('.')[0];
  return ({ users:'perm-purple', products:'perm-green', stores:'perm-amber', categories:'perm-red', orders:'perm-blue', settings:'perm-gray' }[g] || '');
};
const roleStyle = (name) => ({
  admin:  { bg:'#eef0fd', color:'#6366f1', icon:'bi bi-shield-fill-check' },
  vendor: { bg:'#fffbeb', color:'#f59e0b', icon:'bi bi-person-badge-fill' },
  user:   { bg:'#ecfdf5', color:'#10b981', icon:'bi bi-person-fill'       },
}[name] || { bg:'#f5f5f3', color:'#666', icon:'bi bi-person' });

const togglePerm = (perm) => {
  const idx = selectedPerms.value.indexOf(perm);
  idx === -1 ? selectedPerms.value.push(perm) : selectedPerms.value.splice(idx, 1);
};

/* ── Modal ── */
const openEditModal = (role) => {
  editingRole.value  = role;
  selectedPerms.value = [...role.permissions];
  showModal.value    = true;
};

/* ── API ── */
const loadRoles = async () => {
  const res = await ClientService.getRoles();
  roles.value = res.data.roles;
};
const loadUsers = async () => {
  const res = await ClientService.getRoleUsers();
  users.value = res.data.users.map(u => ({ ...u, selectedRole: u.role }));
};
const loadPermissions = async () => {
  const res = await ClientService.getPermissions();
  groupedPermissions.value = res.data.permissions;
};

const assignRole = async (user) => {
  try {
    loadingText.value = 'Assigning role';
    isLoading.value   = true;
    await ClientService.assignRoleToUser(user.id, user.selectedRole);
    toast.success(`Role '${user.selectedRole}' assigned to ${user.name}`);
    user.role = user.selectedRole;
    await loadRoles(); // refresh user counts
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to assign role');
  } finally { isLoading.value = false; }
};

const savePermissions = async () => {
  try {
    loadingText.value = 'Saving permissions';
    isLoading.value   = true;
    await ClientService.updateRolePermissions(
      editingRole.value.id,
      selectedPerms.value
    );
    toast.success('Permissions updated!');
    showModal.value = false;
    await loadRoles();
  } catch (e) {
    toast.error(e.response?.data?.error || 'Failed to update permissions');
  } finally { isLoading.value = false; }
};

onMounted(async () => {
  document.title = 'Admin — Role Management';
  isLoading.value = true; loadingText.value = 'Loading roles';
  await Promise.all([loadRoles(), loadUsers(), loadPermissions()]);
  isLoading.value = false;
});
</script>

<template>
  <div class="rm-page">

    <PremiumLoader :active="isLoading" :text="loadingText" />

    <!-- ── Header ── -->
    <div class="rm-header">
      <div class="rm-header-left">
        <span class="rm-eyebrow">Access Control</span>
        <h1 class="rm-title">Role & Permission Management</h1>
      </div>
      <div class="rm-header-stats">
        <div class="rm-stat">
          <span class="rm-stat-num">{{ roles.length }}</span>
          <span class="rm-stat-label">Roles</span>
        </div>
        <div class="rm-stat-divider"></div>
        <div class="rm-stat">
          <span class="rm-stat-num">{{ totalUsers }}</span>
          <span class="rm-stat-label">Assigned Users</span>
        </div>
        <div class="rm-stat-divider"></div>
        <div class="rm-stat">
          <span class="rm-stat-num">{{ totalPermissions }}</span>
          <span class="rm-stat-label">Permissions</span>
        </div>
      </div>
    </div>

    <!-- ── Roles Grid ── -->
    <div class="rm-roles-grid">
      <div class="rm-role-card" v-for="role in roles" :key="role.id">
        <div class="rm-role-head">
          <div class="rm-role-icon" :style="{ background: roleStyle(role.name).bg }">
            <i :class="roleStyle(role.name).icon" :style="{ color: roleStyle(role.name).color }"></i>
          </div>
          <div class="rm-role-meta">
            <span class="rm-role-name">{{ capitalize(role.name) }}</span>
            <span class="rm-role-users">{{ role.users_count }} user{{ role.users_count !== 1 ? 's' : '' }}</span>
          </div>
          <button class="rm-edit-btn" @click="openEditModal(role)" title="Edit permissions">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <div class="rm-perms-list">
          <span
            v-for="perm in role.permissions" :key="perm"
            class="rm-perm-pill"
            :class="permGroup(perm)"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            {{ perm }}
          </span>
          <span v-if="!role.permissions.length" class="rm-no-perms">No permissions assigned</span>
        </div>
      </div>
    </div>

    <!-- ── Users & Role Assignment Table ── -->
    <div class="rm-card" style="margin-top:1rem">
      <div class="rm-card-head">
        <span class="rm-card-title">Assign Roles to Users</span>
        <div class="rm-search-inner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="rm-search-input" v-model="search" placeholder="Search users…" />
        </div>
      </div>
      <div class="rm-table-wrap">
        <table class="rm-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th>User</th>
              <th>Email</th>
              <th style="width:160px">Current Role</th>
              <th style="width:180px">Assign Role</th>
              <th style="width:100px;text-align:right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="rm-empty">No users found</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" class="rm-row">
              <td><span class="rm-id-badge">#{{ String(user.id).padStart(3,'0') }}</span></td>
              <td>
                <div class="rm-user-cell">
                  <div class="rm-av" :style="{ background: avatarBg(user.role) }">
                    {{ initials(user.name) }}
                  </div>
                  <span class="rm-user-name">{{ user.name }}</span>
                </div>
              </td>
              <td class="rm-muted">{{ user.email }}</td>
              <td>
                <span class="rm-role-badge" :class="'role-' + user.role">{{ user.role }}</span>
              </td>
              <td>
                <select class="rm-select" v-model="user.selectedRole">
                  <option v-for="r in roles" :key="r.id" :value="r.name">{{ capitalize(r.name) }}</option>
                </select>
              </td>
              <td style="text-align:right">
                <button class="rm-assign-btn"
                  
                  @click="assignRole(user)">
                  Save
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Edit Permissions Modal ── -->
    <Teleport to="body">
      <div class="rm-overlay" :class="{ open: showModal }" @click.self="showModal = false">
        <div class="rm-modal">
          <div class="rm-modal-header">
            <div>
              <p class="rm-modal-title">Edit — {{ capitalize(editingRole?.name || '') }}</p>
              <p class="rm-modal-sub">Toggle permissions for this role</p>
            </div>
            <button class="rm-modal-close" @click="showModal = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="rm-modal-body">
            <div v-for="(perms, group) in groupedPermissions" :key="group" class="rm-perm-group">
              <p class="rm-group-label">{{ capitalize(group) }}</p>
              <div class="rm-perm-checks">
                <label
                  v-for="perm in perms" :key="perm.name"
                  class="rm-check-item"
                  :class="{ 'rm-check-on': selectedPerms.includes(perm.name) }"
                  @click="togglePerm(perm.name)"
                >
                  <span class="rm-check-box">
                    <svg v-if="selectedPerms.includes(perm.name)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  {{ perm.name.split('.')[1] }}
                </label>
              </div>
            </div>
          </div>
          <div class="rm-modal-footer">
            <button class="rm-btn-cancel" @click="showModal = false">Cancel</button>
            <button class="rm-btn-save" @click="savePermissions">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

</style>