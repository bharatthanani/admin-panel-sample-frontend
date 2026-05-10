<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { ClientService } from '@/services'
import { env } from '../../../../config.js'
import PremiumLoader from '@/components/PremiumLoader.vue';

const toast = useToast()

const users        = ref([])
const pagination   = ref({})
const isLoading    = ref(false)
const search       = ref('')
const baseImageURL = env.IMAGE_URL

const showAddModal    = ref(false)
const showDeleteModal = ref(false)
const isEditMode      = ref(false)
const userToDelete    = ref(null)
const profilePreview  = ref(null)
const showPassword    = ref(false)
const loadingText      = ref('Loading');

const form = ref({
  id: null,
  first_name: '',
  last_name: '',
  email: '',
  role: '',
  password: '',
  status: '',
  profile_picture: null,
})

/* ── Computed ── */
const filteredUsers = computed(() => {
  if (!users.value) return []
  const q = search.value.toLowerCase()
  return users.value.filter(u =>
    u.first_name?.toLowerCase().includes(q) ||
    u.last_name?.toLowerCase().includes(q)  ||
    u.email?.toLowerCase().includes(q)
  )
})

/* ── Helpers ── */
const roleBadgeClass = (role) => {
  const map = { admin: 'role-admin', editor: 'role-editor', viewer: 'role-viewer', user: 'role-user' }
  return map[role?.toLowerCase()] || 'role-user'
}

const resetForm = () => {
  form.value = { id: null, first_name: '', last_name: '', email: '', role: '', password: '', status: '', profile_picture: null }
  profilePreview.value = null
  showPassword.value = false
}

const closeAddModal = () => {
  showAddModal.value = false
  isEditMode.value = false
  resetForm()
}

const openDeleteModal = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const editUser = (user) => {
  isEditMode.value = true
  form.value = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    password: '',
    status: user.status,
    profile_picture: null,
  }
  profilePreview.value = user.profile_picture
    ? `${baseImageURL}/profile/${user.profile_picture}`
    : null
  showAddModal.value = true
}

/* ── File Upload ── */
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.profile_picture = file
    profilePreview.value = URL.createObjectURL(file)
  }
}

/* ── API Calls ── */
const loadUsers = async (page = 1) => {
  try {
    isLoading.value = true
    const response = await ClientService.getUsers(page)
    users.value     = response.data.users?.data || []
    pagination.value = response.data.users || {}
  } catch (error) {
    console.error(error)
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    const formData = new FormData()
    Object.keys(form.value).forEach(key => {
      if (form.value[key] !== null && form.value[key] !== '') {
        formData.append(key, form.value[key])
      }
    })
    const response = isEditMode.value
      ? await ClientService.updateUser(form.value.id, formData)
      : await ClientService.addUser(formData)
    toast.success(response.data.message)
    loadUsers()
    closeAddModal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Something went wrong!')
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async () => {
  try {
    isLoading.value = true
    const response = await ClientService.deleteUser(userToDelete.value.id)
    toast.success(response.data.message)
    showDeleteModal.value = false
    userToDelete.value = null
    loadUsers()
  } catch (error) {
    toast.error('Delete failed')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  isLoading.value = true;
  loadingText.value = 'Loading Users...';

  loadUsers();
});
</script>


<template>
  <div class="um-page">

    <PremiumLoader :active="isLoading" :text="loadingText" />

    <!-- ───── Page Header ───── -->
    <div class="um-header">
      <div class="um-header-left">
        <span class="um-eyebrow">Team</span>
        <h1 class="um-title">Users Management</h1>
      </div>

      <div class="um-header-stats">
        <div class="um-stat">
          <span class="um-stat-num">{{ pagination.total || 0 }}</span>
          <span class="um-stat-label">Total Users</span>
        </div>
      </div>

      <button v-permission="'users.create'" class="um-add-btn" @click="showAddModal = true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add User
      </button>
    </div>

    <!-- ───── Table Card ───── -->
    <div class="um-card">

      <!-- Search Bar -->
      <div class="um-table-top">
        <div class="um-search-wrap">
          <svg class="um-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            class="um-search-input"
            type="text"
            placeholder="Search by name or email..."
            v-model="search"
          />
        </div>
        <span class="um-result-count">{{ filteredUsers.length }} result{{ filteredUsers.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Table -->
      <div class="um-table-wrap">
        <table class="um-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th style="width:220px">User</th>
              <th>Email</th>
              <th style="width:110px">Role</th>
              <th style="width:100px">Status</th>
              <th style="width:110px; text-align:right" v-permission="['users.update', 'users.delete']">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="um-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="margin-bottom:8px;opacity:.3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>No users found</span>
              </td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" class="um-row">
              <td>
                <span class="um-id-badge">{{ user.id }}</span>
              </td>
              <td>
                <div class="um-user-info">
                  <div class="um-avatar-wrap">
                    <img
                      v-if="user.profile_picture"
                      :src="`${baseImageURL}/profile/${user.profile_picture}`"
                      class="um-avatar"
                      :alt="`${user.first_name} ${user.last_name}`"
                      @error="e => e.target.style.display='none'"
                    />
                    <div v-else class="um-avatar-fallback">
                      {{ (user.first_name?.[0] || '') + (user.last_name?.[0] || '') }}
                    </div>
                    <span class="um-avatar-dot" :class="user.status == 1 ? 'online' : 'offline'"></span>
                  </div>
                  <div>
                    <p class="um-user-name">{{ user.first_name }} {{ user.last_name }}</p>
                    <p class="um-user-role-sub"> {{ user.roles.length ? user.roles[0].name : 'No Role' }}</p>
                  </div>
                </div>
              </td>
              <td class="um-email">{{ user.email }}</td>
              <td>
                <span class="um-role-badge" :class="roleBadgeClass(user.role)"> {{ user.roles.length ? user.roles[0].name : 'No Role' }}</span>
              </td>
              <td>
                <span class="um-status-badge" :class="user.status == 1 ? 'um-active' : 'um-inactive'">
                  <span class="um-status-dot"></span>
                  {{ user.status == 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td v-permission="['users.update', 'users.delete']">
                <div class="um-actions">
                  <button  class="um-btn-edit" title="Edit user" @click="editUser(user)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="um-btn-del" title="Delete user" @click="openDeleteModal(user)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="um-pagination">
        <button
          class="um-page-btn"
          :disabled="pagination.current_page == 1"
          @click="loadUsers(pagination.current_page - 1)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Prev
        </button>

        <template v-for="page in pagination.last_page" :key="page">
          <button
            class="um-page-btn"
            :class="{ 'um-page-active': pagination.current_page == page }"
            @click="loadUsers(page)"
          >
            {{ page }}
          </button>
        </template>

        <button
          class="um-page-btn"
          :disabled="pagination.current_page == pagination.last_page"
          @click="loadUsers(pagination.current_page + 1)"
        >
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

    </div>

    <!-- ───── Add / Edit User Modal ───── -->
    <Teleport to="body">
      <div class="um-overlay" :class="{ open: showAddModal }" @click.self="closeAddModal">
        <div class="um-modal um-modal-lg">

          <div class="um-modal-header">
            <div>
              <p class="um-modal-title">{{ isEditMode ? 'Edit User' : 'Add User' }}</p>
              <p class="um-modal-sub">{{ isEditMode ? 'Update the user details below' : 'Fill in details to create a new user' }}</p>
            </div>
            <button class="um-modal-close" @click="closeAddModal" aria-label="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="um-modal-body">
            <form @submit.prevent="handleSubmit" id="userForm">

              <p class="um-section-label">Personal Info</p>

              <div class="um-row2">
                <div class="um-field">
                  <label class="um-label">First Name</label>
                  <input class="um-input" type="text" v-model="form.first_name" placeholder="e.g. John" required />
                </div>
                <div class="um-field">
                  <label class="um-label">Last Name</label>
                  <input class="um-input" type="text" v-model="form.last_name" placeholder="e.g. Doe" required />
                </div>
              </div>

              <div class="um-row2">
                <div class="um-field">
                  <label class="um-label">Email Address</label>
                  <div class="um-input-icon-wrap">
                    <svg class="um-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input class="um-input um-input-iconed" type="email" v-model="form.email" placeholder="john@example.com" required />
                  </div>
                </div>
                <div class="um-field">
                  <label class="um-label">Password</label>
                  <div class="um-input-icon-wrap">
                    <svg class="um-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input class="um-input um-input-iconed" :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="••••••••" :required="!isEditMode" />
                    <button type="button" class="um-input-toggle" @click="showPassword = !showPassword">
                      <svg v-if="!showPassword" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="um-divider"></div>
              <p class="um-section-label">Permissions & Status</p>

              <div class="um-row2">
                <div class="um-field">
                  <label class="um-label">Role</label>
                  <select class="um-select" v-model="form.role" required>
                    <option value="">— Select Role —</option>
                    <option value="admin">Admin</option>
                    <option value="vendor">Vendor</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div class="um-field">
                  <label class="um-label">Status</label>
                  <select class="um-select" v-model="form.status" required>
                    <option value="">— Select Status —</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div class="um-divider"></div>
              <p class="um-section-label">Profile Picture</p>

              <div class="um-field">
                <label class="um-upload-zone" for="profilePicInput">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>{{ form.profile_picture ? 'Change photo' : 'Click to upload profile picture' }}</span>
                  <input type="file" id="profilePicInput" class="um-file-input" @change="handleFileUpload" accept="image/*" />
                </label>
                <div v-if="profilePreview" class="um-profile-preview">
                  <img :src="profilePreview" alt="Preview" />
                  <button type="button" class="um-preview-remove" @click="profilePreview = null; form.profile_picture = null">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

            </form>
          </div>

          <div class="um-modal-footer">
            <button type="button" class="um-btn-cancel" @click="closeAddModal">Cancel</button>
            <button type="submit" form="userForm" class="um-btn-save">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ isEditMode ? 'Update User' : 'Save User' }}
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- ───── Delete Modal ───── -->
    <Teleport to="body">
      <div class="um-overlay" :class="{ open: showDeleteModal }" @click.self="showDeleteModal = false">
        <div class="um-modal um-modal-sm">

          <div class="um-modal-header">
            <p class="um-modal-title">Confirm deletion</p>
            <button class="um-modal-close" @click="showDeleteModal = false" aria-label="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="um-del-body">
            <div class="um-del-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            </div>
            <p class="um-del-title">Remove this user?</p>
            <p class="um-del-sub">
              <strong>{{ userToDelete?.first_name }} {{ userToDelete?.last_name }}</strong> will be permanently removed. This cannot be undone.
            </p>
          </div>

          <div class="um-modal-footer">
            <button type="button" class="um-btn-cancel" @click="showDeleteModal = false">Keep it</button>
            <button type="button" class="um-btn-danger" @click="deleteUser">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              Yes, delete
            </button>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
/* ─── Reset ─── */
*, *::before, *::after { box-sizing: border-box; }

</style>