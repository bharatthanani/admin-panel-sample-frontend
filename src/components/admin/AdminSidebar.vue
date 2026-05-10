<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth   = useAuthStore();
const router = useRouter();

const fullName  =  auth.user.first_name + ' ' + auth.user.last_name;
const roleNames = auth.user.role;
const capitalize  = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
// Build nav dynamically based on permissions
const navItems = computed(() => [
  {
    to: '/admin/dashboard',
    icon: 'bi bi-speedometer2',
    label: 'Dashboard',
    show: true,                          // always visible
  },
  {
    to: '/admin/users',
    icon: 'bi bi-people',
    label: 'Users',
    show: auth.can('users.list'),
  },
  {
    to: '/admin/role-management',
    icon: 'bi bi-shield-lock',
    label: 'Roles & Permissions',
    show: auth.isAdmin,                  // admin only
  },
  {
    to: '/admin/store-management',
    icon: 'bi bi-shop',
    label: 'Stores',
    show: auth.can('stores.list'),
  },
  {
    to: '/admin/product-management',
    icon: 'bi bi-box-seam',
    label: 'Products',
    show: auth.can('products.list'),
  },
  
  {
    to: '/admin/category-management',
    icon: 'bi bi-grid',
    label: 'Categories',
    show: auth.can('categories.list'),
  },
  {
    to: '/admin/settings',
    icon: 'bi bi-gear',
    label: 'Settings',
    show: auth.can('settings.list'),
  },
].filter(item => item.show));

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <aside class="sb">

    <div class="sb-logo">
      <div class="sb-mark">
        <i class="bi bi-lightning-charge-fill"></i>
      </div>

      <div>
        <div class="sb-name">
          <router-link to="/">AdminPanel</router-link>
        </div>

        <div class="sb-sub">Management Suite</div>
      </div>
    </div>

    <div class="sb-scroll">

      <div class="sb-section">Main</div>

      <nav class="sb-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--on"
        >
          <span class="ni">
            <i :class="item.icon"></i>
          </span>

          <span>{{ item.label }}</span>
        </router-link>
      </nav>

    </div>

    <div class="sb-foot">
      <img
        :src="`https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=80`"
        class="sb-av"
      />

      <div class="sb-user">
        <span class="sb-uname">
          {{ capitalize(fullName) }}
        </span>

        <span class="sb-urole">
          {{ capitalize(roleNames) }}
        </span>
      </div>

      <button class="sb-logout" @click="handleLogout">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>

  </aside>
</template>