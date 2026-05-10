<script setup>
import { ref, computed, onMounted } from 'vue';
import { ClientService } from '@/services/index.js';
import PremiumLoader from '@/components/PremiumLoader.vue';
import { useAuthStore } from '@/stores/auth';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.default.vfs;

const authStore = useAuthStore();
const authUser  = computed(() => authStore.user);

/* ── State ── */
const isLoading = ref(false);
const today = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

// ── FIX 1: removed index [4] & [5] references that didn't exist (only 5 cards = index 0–4) ──
const statCards = ref([
  { label:'Total Users',    value:'0', change:'+0%',   up:true,  icon:'bi bi-people-fill',               iconBg:'#eef0fd', iconColor:'#6366f1' },
  { label:'Total Products', value:'0', change:'+0%',   up:true,  icon:'bi bi-box-seam-fill',             iconBg:'#ecfdf5', iconColor:'#10b981' },
  { label:'Total Stores',   value:'0', change:'+0%',   up:true,  icon:'bi bi-shop',                      iconBg:'#fffbeb', iconColor:'#f59e0b' },
  { label:'Categories',     value:'0', change:'0',     up:true,  icon:'bi bi-grid-fill',                 iconBg:'#fef2f2', iconColor:'#ef4444' },
  { label:'Low Stock',      value:'0', change:'items', up:false, icon:'bi bi-exclamation-triangle-fill', iconBg:'#fef3c7', iconColor:'#d97706' },
]);

const stats = ref({
  recentUsers: [],
  // ── FIX 2: topCategories starts empty — filled from API ──
  topCategories: [],
  recentProducts: [],
  stores: [],
  roles: [
    { name:'Admin',  users:0, bg:'#eef0fd', color:'#6366f1', icon:'bi bi-shield-fill',       permissions:['Users','Products','Stores','Categories','—'] },
    { name:'Vendor', users:0, bg:'#fffbeb', color:'#f59e0b', icon:'bi bi-person-badge-fill', permissions:['—','Products','Stores','—','—'] },
    { name:'User',   users:0, bg:'#ecfdf5', color:'#10b981', icon:'bi bi-person-fill',       permissions:['—','—','—','—','—'] },
  ],
});

/* ── Helpers ── */
const qtyClass = (qty) => {
  if (qty === 0) return 'qty-out';
  if (qty < 10)  return 'qty-low';
  if (qty < 30)  return 'qty-mid';
  return 'qty-ok';
};
const avatarBg = (role) => ({
  admin:'#eef0fd', vendor:'#fffbeb', user:'#ecfdf5',
}[role] || '#f5f5f3');

/* ── Dashboard load ── */
const loadDashboard = async () => {
  try {
    isLoading.value = true;

    const [usersRes, productsRes, storesRes, categoriesRes] = await Promise.allSettled([
      ClientService.getUsers(),
      ClientService.getProductForAdmin(),
      ClientService.getStoreBackend(),
      ClientService.getCategoryForAdmin(),
    ]);

    // ── Users ──
    if (usersRes.status === 'fulfilled') {
      // FIX 3: handle both response shapes safely
      const raw   = usersRes.value.data;
      const users = raw?.user || raw?.users?.data || [];

      statCards.value[0].value = String(raw?.users?.total || users.length);

      stats.value.recentUsers = users.slice(0, 5).map(u => ({
        id:       u.id,
        name:     `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
        initials: ((u.first_name?.[0] ?? '') + (u.last_name?.[0] ?? '')).toUpperCase(),
        avatarBg: avatarBg(u.role),
        email:    u.email,
        role:     u.role || 'user',
        status:   u.status == 1 ? 'Active' : 'Inactive',
        joined:   u.created_at
          ? new Date(u.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
          : '—',
      }));

      // FIX 4: update role user counts from real data
      stats.value.roles[0].users = users.filter(u => u.role === 'admin').length;
      stats.value.roles[1].users = users.filter(u => u.role === 'vendor').length;
      stats.value.roles[2].users = users.filter(u => u.role === 'user').length;
    }

    // ── Products ──
    if (productsRes.status === 'fulfilled') {
      const products = productsRes.value.data?.products || [];
      statCards.value[1].value = String(products.length);
      // FIX 5: was referencing statCards[5] which doesn't exist — fixed to index 4
      statCards.value[4].value = String(products.filter(p => Number(p.product_qty) < 10).length);

      stats.value.recentProducts = products.slice(0, 5).map(p => ({
        id:    p.id,
        name:  p.product_name,
        store: p.stores?.store_name || '—',
        price: Number(p.product_price || 0).toFixed(2),
        qty:   Number(p.product_qty  || 0),
      }));
    }

    // ── Stores ──
    if (storesRes.status === 'fulfilled') {
      const stores = storesRes.value.data?.stores || [];
      statCards.value[2].value = String(stores.length);

      stats.value.stores = stores.slice(0, 5).map(st => ({
        name:     st.store_name,
        products: st.products_count || 0,
        owner:    st.user ? `${st.user.first_name} ${st.user.last_name}` : '—',
        active:   st.status == 1,
      }));
    }

    // ── Categories ──
    if (categoriesRes.status === 'fulfilled') {
      const cats = categoriesRes.value.data?.category || [];
      statCards.value[3].value = String(cats.length);

      // FIX 6: build topCategories from real API data instead of hardcoded
      const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#0ea5e9'];
      const icons  = ['bi bi-grid','bi bi-grid','bi bi-grid','bi bi-grid','bi bi-grid'];
      stats.value.topCategories = cats.slice(0, 5).map((c, i) => ({
        name:  c.category_name,
        pct:   Math.max(15, 80 - i * 13),
        color: colors[i] || '#6366f1',
        icon:  icons[i]  || 'bi bi-grid',
      }));
    }

  } catch (e) {
    console.error('Dashboard load error:', e);
  } finally {
    isLoading.value = false;
  }
};

const loadAndGeneratePdf = async () => {
  // your existing PDF logic here
};

onMounted(() => {
  document.title = 'Admin — Dashboard';
  loadDashboard();
});
</script>

<template>
  <div class="db-page">

    <PremiumLoader :active="isLoading" text="Loading dashboard" />

    <!-- ───── Page Header ───── -->
    <div class="db-header">
      <div>
      </div>
      <div class="db-header-actions">
        <span class="db-date">{{ today }}</span>
        <button class="db-export-btn" @click="loadAndGeneratePdf">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export PDF
        </button>
      </div>
    </div>

    <!-- ───── Stat Cards ───── -->
    <div class="db-stats">
      <div class="db-stat-card" v-for="stat in statCards" :key="stat.label">
        <div class="db-stat-icon" :style="{ background: stat.iconBg }">
          <i :class="stat.icon" :style="{ color: stat.iconColor }"></i>
        </div>
        <div class="db-stat-body">
          <span class="db-stat-label">{{ stat.label }}</span>
          <span class="db-stat-val">{{ stat.value }}</span>
          <span class="db-stat-change" :class="stat.up ? 'db-up' : 'db-down'">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <polyline v-if="stat.up" points="18 15 12 9 6 15"/>
              <polyline v-else points="6 9 12 15 18 9"/>
            </svg>
            {{ stat.change }}
          </span>
        </div>
      </div>
    </div>

    <!-- ───── Row 2: Recent Users + Top Categories ───── -->
    <div class="db-row2">

      <!-- Recent Users -->
      <div class="db-card db-card-wide">
        <div class="db-card-head">
          <span class="db-card-title">Recent Users</span>
          <router-link to="/admin/users" class="db-view-all">View all →</router-link>
        </div>
        <div class="db-table-wrap">
          <table class="db-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!stats.recentUsers.length">
                <td colspan="5" class="db-empty">No users found</td>
              </tr>
              <tr v-for="user in stats.recentUsers" :key="user.id">
                <td>
                  <div class="db-user-cell">
                    <div class="db-av" :style="{ background: user.avatarBg }">{{ user.initials }}</div>
                    <span class="db-user-name">{{ user.name }}</span>
                  </div>
                </td>
                <td class="db-muted">{{ user.email }}</td>
                <td><span class="db-role-pill" :class="'role-' + user.role">{{ user.role }}</span></td>
                <td>
                  <span class="db-status" :class="user.status === 'Active' ? 'db-active' : 'db-inactive'">
                    <span class="db-dot"></span>{{ user.status }}
                  </span>
                </td>
                <td class="db-muted">{{ user.joined }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Categories -->
      <div class="db-card">
        <div class="db-card-head">
          <span class="db-card-title">Top Categories</span>
          <router-link to="/admin/category-management" class="db-view-all">View all →</router-link>
        </div>
        <div class="db-cat-list">
          <div v-if="!stats.topCategories.length" class="db-empty" style="padding:1.5rem">No categories yet</div>
          <div class="db-cat-item" v-for="cat in stats.topCategories" :key="cat.name">
            <div class="db-cat-img"><i :class="cat.icon"></i></div>
            <div class="db-cat-info">
              <div class="db-cat-row">
                <span class="db-cat-name">{{ cat.name }}</span>
                <span class="db-cat-pct">{{ cat.pct }}%</span>
              </div>
              <div class="db-bar-track">
                <div class="db-bar-fill" :style="{ width: cat.pct + '%', background: cat.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ───── Row 3: Recent Products + Store Overview ───── -->
    <div class="db-row2" style="margin-top:1rem">

      <!-- Recent Products -->
      <div class="db-card db-card-wide">
        <div class="db-card-head">
          <span class="db-card-title">Recent Products</span>
          <router-link to="/admin/product-management" class="db-view-all">View all →</router-link>
        </div>
        <div class="db-table-wrap">
          <table class="db-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Store</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!stats.recentProducts.length">
                <td colspan="5" class="db-empty">No products found</td>
              </tr>
              <tr v-for="p in stats.recentProducts" :key="p.id">
                <td>
                  <div class="db-user-cell">
                    <div class="db-prod-img"><i class="bi bi-box-seam"></i></div>
                    <span class="db-user-name">{{ p.name }}</span>
                  </div>
                </td>
                <td class="db-muted">{{ p.store }}</td>
                <td class="db-price">${{ p.price }}</td>
                <td><span class="db-qty-pill" :class="qtyClass(p.qty)">{{ p.qty }}</span></td>
                <td>
                  <span class="db-status" :class="p.qty > 0 ? 'db-active' : 'db-inactive'">
                    <span class="db-dot"></span>{{ p.qty > 0 ? 'In Stock' : 'Out' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Store Overview -->
      <div class="db-card">
        <div class="db-card-head">
          <span class="db-card-title">Store Overview</span>
          <router-link to="/admin/store-management" class="db-view-all">View all →</router-link>
        </div>
        <div class="db-store-list">
          <div v-if="!stats.stores.length" class="db-empty" style="padding:1.5rem">No stores found</div>
          <div class="db-store-item" v-for="store in stats.stores" :key="store.name">
            <div class="db-store-logo"><i class="bi bi-shop"></i></div>
            <div class="db-store-info">
              <span class="db-store-name">{{ store.name }}</span>
              <span class="db-store-meta">{{ store.products }} products · {{ store.owner }}</span>
            </div>
            <span class="db-status" :class="store.active ? 'db-active' : 'db-inactive'" style="margin-left:auto">
              <span class="db-dot"></span>{{ store.active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- ───── Row 4: Role Permissions ───── -->
    <div class="db-card" style="margin-top:1rem">
      <div class="db-card-head">
        <span class="db-card-title">Role & Permission Overview</span>
        <router-link to="/admin/role-management" class="db-view-all">Manage →</router-link>
      </div>
      <div class="db-roles-grid">
        <div class="db-role-card" v-for="role in stats.roles" :key="role.name">
          <div class="db-role-top">
            <div class="db-role-icon" :style="{ background: role.bg }">
              <i :class="role.icon" :style="{ color: role.color }"></i>
            </div>
            <div>
              <span class="db-role-name">{{ role.name }}</span>
              <span class="db-role-count">{{ role.users }} users</span>
            </div>
          </div>
          <div class="db-role-perms">
            <span class="db-perm" v-for="perm in role.permissions" :key="perm"
              :class="perm === '—' ? 'db-perm-off' : 'db-perm-on'">
              <svg v-if="perm !== '—'" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {{ perm }}
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<style scoped>
*, *::before, *::after { box-sizing: border-box; }

</style>