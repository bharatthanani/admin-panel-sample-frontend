<script setup>
defineProps({
  pageTitle: String,
  roleNames: String,
  sidebarOpen: Boolean
});

defineEmits(['toggleSidebar', 'logout']);

const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
</script>

<template>
  <header class="topbar">

    <button
      class="ham"
      @click="$emit('toggleSidebar')"
    >
      <i class="bi bi-list"></i>
    </button>

    <div class="bc">
      <span class="bc-home">
        <i class="bi bi-house"></i>
      </span>

      <i class="bi bi-chevron-right bc-sep"></i>

      <span class="bc-curr">
        {{ pageTitle }}
      </span>
    </div>

    <div class="topbar-r">

      <span class="role-tag">
        {{ capitalize(roleNames) }}
      </span>

      <button
        class="tb-logout"
        @click="$emit('logout')"
      >
        Logout
      </button>

    </div>

  </header>
</template>