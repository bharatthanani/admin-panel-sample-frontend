<script setup>
import { ref, computed, onMounted } from 'vue';
import { ClientService } from '@/services';
import { useToast } from 'vue-toastification';
import { env } from '../../../../config.js';
import PremiumLoader from '@/components/PremiumLoader.vue';

const toast = useToast();

/* ── State ── */
const stores        = ref([]);
const categories    = ref([]);
const tags          = ref([]);
const users         = ref([]);
const isLoading     = ref(false);
const searchQuery   = ref('');
const showModal     = ref(false);
const showDeleteModal = ref(false);
const isEdit        = ref(false);
const storeToDelete = ref(null);
const logoPreview   = ref(null);
const coverPreview  = ref(null);
const baseImageURL  = env.IMAGE_URL;
const loadingText      = ref('Loading');

const storeForm = ref({
  id: null, store_name: '', category_id: [], tag_id: [],
  store_description: '', status: '1', store_logo: '', store_cover_image: '', user_id: '',
});

/* ── Computed ── */
const filteredStores = computed(() => {
  if (!searchQuery.value) return stores.value;
  const q = searchQuery.value.toLowerCase();
  return stores.value.filter(s =>
    s.store_name.toLowerCase().includes(q) ||
    (s.store_description || '').toLowerCase().includes(q)
  );
});
const activeStoreCount   = computed(() => stores.value.filter(s => s.status == 1).length);
const inactiveStoreCount = computed(() => stores.value.filter(s => s.status != 1).length);

/* ── Helpers ── */
const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const toggleItem = (arr, id) => {
  const idx = arr.indexOf(id);
  idx === -1 ? arr.push(id) : arr.splice(idx, 1);
};

const resetForm = () => {
  storeForm.value = { id: null, store_name: '', category_id: [], tag_id: [], store_description: '', status: '1', store_logo: '', store_cover_image: '', user_id: '' };
  logoPreview.value = null; coverPreview.value = null;
};
const openAddModal = () => { isEdit.value = false; resetForm(); showModal.value = true; };
const openEditModal = (store) => {
  isEdit.value = true;
  storeForm.value.id               = store.id;
  storeForm.value.store_name       = store.store_name;
  storeForm.value.store_description = store.store_description;
  storeForm.value.status           = String(store.status);
  storeForm.value.user_id          = store.user_id || '';
  storeForm.value.category_id      = store.categories?.map(c => c.id) || [];
  storeForm.value.tag_id           = store.tags?.map(t => t.id) || [];
  logoPreview.value  = store.store_logo        ? `${baseImageURL}/store/${store.store_logo}` : null;
  coverPreview.value = store.store_cover_image ? `${baseImageURL}/store/${store.store_cover_image}` : null;
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; resetForm(); };
const openDeleteModal = (store) => { storeToDelete.value = store; showDeleteModal.value = true; };

const handleLogoUpload  = (e) => { const f = e.target.files[0]; if (f) { storeForm.value.store_logo = f; logoPreview.value = URL.createObjectURL(f); } };
const handleCoverUpload = (e) => { const f = e.target.files[0]; if (f) { storeForm.value.store_cover_image = f; coverPreview.value = URL.createObjectURL(f); } };

/* ── API ── */
const getStore = async () => {
  try { isLoading.value = true; const res = await ClientService.getStoreBackend(); stores.value = res.data.success ? res.data.stores : []; }
  catch (e) { toast.error(e.response?.data?.error || 'Failed to load stores.'); }
  finally { isLoading.value = false; }
};
const getCategory = async () => {
  try { categories.value = (await ClientService.getCategoryForAdmin()).data.category; } catch (e) { console.error(e); }
};
const getTags = async () => {
  try { tags.value = (await ClientService.getTags()).data.tags; } catch (e) { console.error(e); }
};
const loadUsers = async () => {
  try { users.value = (await ClientService.getVendors()).data.vendors; } catch (e) { console.error(e); }
};
const submitStore = async () => {
  try {
    isLoading.value = true;
    const fd = new FormData();
    fd.append('store_name', storeForm.value.store_name);
    fd.append('store_description', storeForm.value.store_description);
    fd.append('user_id', storeForm.value.user_id);
    fd.append('status', storeForm.value.status);
    storeForm.value.category_id.forEach(id => fd.append('category_id[]', id));
    storeForm.value.tag_id.forEach(id => fd.append('tag_id[]', id));
    if (storeForm.value.store_logo instanceof File) fd.append('store_logo', storeForm.value.store_logo);
    if (storeForm.value.store_cover_image instanceof File) fd.append('store_cover_image', storeForm.value.store_cover_image);
    if (isEdit.value) fd.append('id', storeForm.value.id);
    const res = isEdit.value
      ? await ClientService.updateStore(storeForm.value.id, fd)
      : await ClientService.addStore(fd);
    if (res.data.success) { toast.success(res.data.message || `Store ${isEdit.value ? 'updated' : 'added'}!`); getStore(); closeModal(); }
    else toast.error(res.data.error || 'Something went wrong.');
  } catch (e) { toast.error(e.response?.data?.error || 'An unexpected error occurred.'); }
  finally { isLoading.value = false; }
};
const confirmDelete = async () => {
  if (!storeToDelete.value) return;
  try {
    isLoading.value = true;
    await ClientService.deleteStore(storeToDelete.value.id);
    toast.success('Store deleted successfully!');
    showDeleteModal.value = false; storeToDelete.value = null; getStore();
  } catch (e) { toast.error(e.response?.data?.message || 'Something went wrong!'); }
  finally { isLoading.value = false; }
};

onMounted(() => {
  document.title = 'Dashboard - Stores';
  isLoading.value = true; loadingText.value = 'Loading Stores...';
  getStore(); getCategory(); getTags(); loadUsers();
});
</script>

<template>
  <div class="sm-page">

     <PremiumLoader :active="isLoading" :text="loadingText" />

    <!-- ───── Page Header ───── -->
    <div class="sm-header">
      <div class="sm-header-left">
        <span class="sm-eyebrow">Marketplace</span>
        <h1 class="sm-title">Manage Stores</h1>
      </div>
      <div class="sm-header-stats">
        <div class="sm-stat">
          <span class="sm-stat-num">{{ stores.length }}</span>
          <span class="sm-stat-label">Total Stores</span>
        </div>
        <div class="sm-stat-divider"></div>
        <div class="sm-stat">
          <span class="sm-stat-num">{{ activeStoreCount }}</span>
          <span class="sm-stat-label">Active</span>
        </div>
        <div class="sm-stat-divider"></div>
        <div class="sm-stat">
          <span class="sm-stat-num sm-stat-warn">{{ inactiveStoreCount }}</span>
          <span class="sm-stat-label">Inactive</span>
        </div>
      </div>
      <button class="sm-add-btn" @click="openAddModal" v-permission="['stores.create']">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Store
      </button>
    </div>

    <!-- ───── Search Bar ───── -->
    <div class="sm-search-wrap">
      <div class="sm-search-inner">
        <svg class="sm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="sm-search-input" type="text" v-model="searchQuery" placeholder="Search by store name or description…" />
        <button v-if="searchQuery" class="sm-search-clear" @click="searchQuery = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- ───── Table Card ───── -->
    <div class="sm-card">
      <div class="sm-table-wrap">
        <table class="sm-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th style="width:200px">Store</th>
              <th>Categories</th>
              <th style="width:90px">Status</th>
              <th style="width:120px">Created</th>
              <th style="width:120px" v-permission="['stores.products']">Products</th>
              <th style="width:170px; text-align:right" v-permission="['stores.update', 'stores.delete']">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredStores.length === 0">
              <td colspan="10" class="sm-empty" align="center">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="margin-bottom:8px;opacity:.35"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>No stores found</span>
              </td>
            </tr>
            <tr v-for="store in filteredStores" :key="store.id" class="sm-row">
              <td>
                <span class="sm-id-badge">{{ store.id }}</span>
              </td>
              <td>
                <div class="sm-store-cell">
                  <div class="sm-logo-wrap">
                    <img
                      v-if="store.store_logo"
                      :src="`${baseImageURL}/store/${store.store_logo}`"
                      :alt="store.store_name"
                      @error="e => e.target.style.display='none'"
                    />
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  </div>
                  <span class="sm-store-name">{{ store.store_name }}</span>
                </div>
              </td>
              <td>
                <div class="sm-cats">
                  <span
                    v-for="(cat, i) in store.categories"
                    :key="i"
                    class="sm-cat-pill"
                  >{{ cat.category_name }}</span>
                  <span v-if="!store.categories || store.categories.length === 0" class="sm-no-cats">—</span>
                </div>
              </td>
              <td>
                <span class="sm-status-badge" :class="store.status == 1 ? 'sm-status-active' : 'sm-status-inactive'">
                  <span class="sm-status-dot"></span>
                  {{ store.status == 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="sm-date">{{ formatDate(store.created_at) }}</td>
              <td class="sm-date">
              <button
                v-permission="['stores.products']"
                @click="$router.push(`/admin/store-management/${store.id}/products`)"
                title="View Products"
                style="
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  padding: 6px 10px;
                  border-radius: 8px;
                  border: 1px solid #dbeafe;
                  background: #eff6ff;
                  color: #1d4ed8;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: 0.2s;
                "
                onmouseover="this.style.background='#1d4ed8';this.style.color='#fff';"
                onmouseout="this.style.background='#eff6ff';this.style.color='#1d4ed8';"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>

                <span>View</span>
              </button>
            </td>
              <td v-permission="['stores.update', 'stores.delete']">
                <div class="sm-actions">
                  <button class="sm-btn-edit" @click="openEditModal(store)" title="Edit">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="sm-btn-del" @click="openDeleteModal(store)" title="Delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ───── Add / Edit Modal ───── -->
    <Teleport to="body">
      <div class="sm-overlay" :class="{ open: showModal }" @click.self="closeModal">
        <div class="sm-modal sm-modal-lg">

          <div class="sm-modal-header">
            <div>
              <p class="sm-modal-title">{{ isEdit ? 'Edit Store' : 'Add Store' }}</p>
              <p class="sm-modal-sub">{{ isEdit ? 'Update the store details below' : 'Fill in the details to create a new store' }}</p>
            </div>
            <button class="sm-modal-close" @click="closeModal" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="sm-modal-body">
            <form @submit.prevent="submitStore" id="storeForm">

              <!-- Basic Info -->
              <p class="sm-section-label">Basic Info</p>

              <div class="sm-field">
                <label class="sm-label">Store Name</label>
                <input class="sm-input" type="text" v-model="storeForm.store_name" placeholder="e.g. Urban Outfitters" required />
              </div>

              <div class="sm-row2">
                <div class="sm-field">
                  <label class="sm-label">Assign User</label>
                  <select class="sm-select" v-model="storeForm.user_id" required>
                    <option value="">— Select User —</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.first_name }} {{ user.last_name }}
                    </option>
                  </select>
                </div>
                <div class="sm-field">
                  <label class="sm-label">Status</label>
                  <select class="sm-select" v-model="storeForm.status">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div class="sm-field">
                <label class="sm-label">Description</label>
                <textarea class="sm-textarea" v-model="storeForm.store_description" placeholder="Brief description of the store…" rows="3"></textarea>
              </div>

              <div class="sm-divider"></div>

              <!-- Categories & Tags -->
              <p class="sm-section-label">Categories & Tags</p>

              <div class="sm-row2">
                <div class="sm-field">
                  <label class="sm-label">Categories</label>
                  <div class="sm-multi-select-wrap">
                    <div
                      v-for="cat in categories"
                      :key="cat.id"
                      class="sm-check-item"
                      :class="{ 'sm-check-item--on': storeForm.category_id.includes(cat.id) }"
                      @click="toggleItem(storeForm.category_id, cat.id)"
                    >
                      <span class="sm-check-box">
                        <svg v-if="storeForm.category_id.includes(cat.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                      {{ cat.category_name }}
                    </div>
                  </div>
                </div>
                <div class="sm-field">
                  <label class="sm-label">Tags</label>
                  <div class="sm-multi-select-wrap">
                    <div
                      v-for="tag in tags"
                      :key="tag.id"
                      class="sm-check-item"
                      :class="{ 'sm-check-item--on': storeForm.tag_id.includes(tag.id) }"
                      @click="toggleItem(storeForm.tag_id, tag.id)"
                    >
                      <span class="sm-check-box">
                        <svg v-if="storeForm.tag_id.includes(tag.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                      {{ tag.tag_name }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="sm-divider"></div>

              <!-- Images -->
              <p class="sm-section-label">Images</p>

              <div class="sm-row2">
                <div class="sm-field">
                  <label class="sm-label">Store Logo</label>
                  <label class="sm-upload-zone" for="storeLogo">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>Click to upload</span>
                    <input type="file" id="storeLogo" class="sm-file-input" @change="handleLogoUpload" accept="image/*" />
                  </label>
                  <div v-if="logoPreview" class="sm-preview-single">
                    <img :src="logoPreview" alt="Logo Preview" />
                    <button type="button" class="sm-preview-remove" @click="logoPreview = null; storeForm.store_logo = ''">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>

                <div class="sm-field">
                  <label class="sm-label">Cover Image</label>
                  <label class="sm-upload-zone" for="storeCover">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
                    <span>Click to upload</span>
                    <input type="file" id="storeCover" class="sm-file-input" @change="handleCoverUpload" accept="image/*" />
                  </label>
                  <div v-if="coverPreview" class="sm-preview-single sm-preview-cover">
                    <img :src="coverPreview" alt="Cover Preview" />
                    <button type="button" class="sm-preview-remove" @click="coverPreview = null; storeForm.store_cover_image = ''">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </div>

            </form>
          </div>

          <div class="sm-modal-footer">
            <button type="button" class="sm-btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" form="storeForm" class="sm-btn-save">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ isEdit ? 'Update Store' : 'Save Store' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ───── Delete Modal ───── -->
    <Teleport to="body">
      <div class="sm-overlay" :class="{ open: showDeleteModal }" @click.self="showDeleteModal = false">
        <div class="sm-modal sm-modal-sm">
          <div class="sm-modal-header">
            <p class="sm-modal-title">Confirm deletion</p>
            <button class="sm-modal-close" @click="showDeleteModal = false" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="sm-del-body">
            <div class="sm-del-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <p class="sm-del-title">Delete this store?</p>
            <p class="sm-del-sub">
              <strong>{{ storeToDelete?.store_name }}</strong> and all its data will be permanently removed. This cannot be undone.
            </p>
          </div>
          <div class="sm-modal-footer">
            <button type="button" class="sm-btn-cancel" @click="showDeleteModal = false">Keep it</button>
            <button type="button" class="sm-btn-danger" @click="confirmDelete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }
.sm-empty {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.sm-empty svg {
  display: block;
  margin: 0 auto 10px;
}

.sm-empty span {
  display: block;
  font-size: 14px;
  font-weight: 500;
}

</style>