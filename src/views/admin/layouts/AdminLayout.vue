<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

import AdminSidebar from '@/components/admin/AdminSidebar.vue';
import AdminHeader from '@/components/admin/AdminHeader.vue';

const auth = useAuthStore();
const router = useRouter();

const sidebarOpen = ref(false);

const roleNames = auth.user.role;

const pageTitle = 'Dashboard';

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <div class="shell">
    <AdminSidebar />

    <div class="main" style="position: relative; flex: 1; overflow: hidden;">
       <AdminHeader
        :pageTitle="pageTitle"
        :roleNames="roleNames"
        :sidebarOpen="sidebarOpen"
        @toggleSidebar="sidebarOpen = !sidebarOpen"
        @logout="handleLogout"
      />
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

/* ADD THIS */
.pm-page {
  position: relative;
  min-height: 100%;
}
</style>