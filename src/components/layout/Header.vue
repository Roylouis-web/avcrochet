<script setup>
import { ref, onUnmounted, nextTick, watch } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';
import { Query } from 'appwrite';
import SearchBar from './SearchBar.vue';

const router = useRouter();
const route = useRoute();
const isMenuOpen = ref(false);
const isVisible = ref(false);
const searchInput = ref(null);

const user = ref(null);
const isAdmin = ref(false);
const cartCount = ref(0);
let unsubscribe = null;

const updateCartCount = async (userId) => {
  try {
    const response = await AppwriteService.getCarts([
      Query.equal('userId', userId)
    ]);
    const items = response.rows || response.documents || [];
    cartCount.value = items.length;
  } catch (error) {
    console.error("Could not fetch cart count:", error);
  }
};

const checkAuth = async () => {
  const fullUser = await AppwriteService.getFullUser();

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  if (fullUser) {
    user.value = fullUser;
    isAdmin.value = fullUser.role === 'admin';

    if (!isAdmin.value) {
      updateCartCount(fullUser.$id);
      const channel = `databases.${AppwriteService.dbId}.collections.${AppwriteService.cols.carts}.documents`;
      unsubscribe = AppwriteService.client.subscribe(channel, (response) => {
        if (response.events.some(e => e.includes('.create') || e.includes('.delete'))) {
          updateCartCount(fullUser.$id);
        }
      });
    }
  } else {
    user.value = null;
    isAdmin.value = false;
    cartCount.value = 0;
  }
};

watch(() => route.path, () => {
  checkAuth();
}, { immediate: true });

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) isVisible.value = false;
};

const toggleSearch = async () => {
  isVisible.value = !isVisible.value;
  if (isVisible.value) {
    isMenuOpen.value = false;
    await nextTick();
    searchInput.value?.focus();
  }
};

const handleLogout = async () => {
  try {
    if (unsubscribe) unsubscribe();
    await AppwriteService.logout();
    user.value = null;
    isAdmin.value = false;
    cartCount.value = 0;
    isMenuOpen.value = false;
    router.push('/login');
  } catch (error) {
    console.error("Logout failed", error);
  }
};
</script>

<template>
  <header class="relative bg-black z-50 text-[#FFD700]">
    <!-- 3-Column Grid: [Logo] [Links (Wrap/Center)] [Icons] -->
    <nav class="grid grid-cols-[auto_1fr_auto] items-center px-6 py-4 border-b border-gray-900 min-h-[80px] gap-8">

      <!-- 1. LOGO (Left) -->
      <div class="flex justify-start shrink-0">
        <RouterLink to="/" class="transition-opacity">
          <img src="/logo.jpeg" alt="Logo" class="w-75 md:60 h-auto" />

        </RouterLink>
      </div>

      <!-- 2. DESKTOP NAVIGATION (Center - Wraps for large screens) -->
      <div
        class="hidden md:flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm font-medium uppercase tracking-widest text-center">
        <RouterLink v-for="link in ['Home', 'Products', 'Orders', 'FAQ', 'Contact']" :key="link"
          :to="link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`"
          active-class="text-[#FFD700] opacity-100 border-b border-[#D4AF37]"
          class="opacity-70 hover:opacity-100 transition-opacity pb-1 whitespace-nowrap">
          {{ link }}
        </RouterLink>

        <!-- ADMIN ONLY LINKS -->
        <template v-if="isAdmin">
          <RouterLink to="/products/create" active-class="text-[#FFD700] opacity-100 border-b border-[#D4AF37]"
            class="opacity-70 hover:opacity-100 transition-opacity pb-1 whitespace-nowrap">
            Create
          </RouterLink>
          <RouterLink to="/income" active-class="text-[#FFD700] opacity-100 border-b border-[#D4AF37]"
            class="opacity-70 hover:opacity-100 transition-opacity pb-1 whitespace-nowrap">
            Income
          </RouterLink>
        </template>

        <RouterLink v-else-if="user" to="/edit_profile"
          active-class="text-[#FFD700] opacity-100 border-b border-[#D4AF37]"
          class="opacity-70 hover:opacity-100 transition-opacity pb-1 whitespace-nowrap">
          Profile
        </RouterLink>

        <!-- Desktop Logout -->
        <button v-if="user" @click="handleLogout"
          class="opacity-70 hover:opacity-100 transition-opacity pb-1 text-red-500 uppercase whitespace-nowrap">
          Logout
        </button>
      </div>

      <!-- 3. ICONS (Right) -->
      <div class="flex items-center justify-end gap-5 shrink-0">
        <button @click="toggleSearch" class="hover:opacity-60 transition-opacity text-[#FFD700]" aria-label="Search">
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>

        <RouterLink :to="user ? '/edit_profile' : '/login'" class="hover:opacity-60 transition-opacity text-[#FFD700]">
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </RouterLink>

        <RouterLink v-if="!isAdmin" to="/cart" class="hover:opacity-60 transition-opacity relative text-[#FFD700]">
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <span v-if="cartCount > 0"
            class="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-black">
            {{ cartCount }}
          </span>
        </RouterLink>

        <!-- Mobile Menu Button -->
        <button @click="toggleMenu" class="md:hidden hover:opacity-60 transition-opacity text-[#FFD700]">
          <svg v-if="!isMenuOpen" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <svg v-else xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="size-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>

    <SearchBar :isVisible="isVisible" @close="isVisible = false" />

    <!-- Mobile Menu -->
    <Transition name="expand">
      <div v-if="isMenuOpen"
        class="md:hidden absolute w-full bg-black border-b border-gray-900 shadow-xl overflow-hidden z-40">
        <ul class="flex flex-col text-sm font-bold tracking-widest uppercase">
          <RouterLink v-for="link in ['Home', 'Products', 'Orders', 'FAQ', 'Contact']" :key="link"
            @click="isMenuOpen = false" :to="link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`"
            class="px-8 py-5 border-b border-gray-900 active:bg-gray-900 text-[#FFD700]">
            <li>{{ link }}</li>
          </RouterLink>

          <!-- ADMIN ONLY MOBILE LINKS -->
          <template v-if="isAdmin">
            <RouterLink to="/products/create" @click="isMenuOpen = false"
              class="px-8 py-5 border-b border-gray-900 active:bg-gray-900 text-[#FFD700]">
              <li>Create</li>
            </RouterLink>
            <RouterLink to="/income" @click="isMenuOpen = false"
              class="px-8 py-5 border-b border-gray-900 active:bg-gray-900 text-[#FFD700]">
              <li>Income</li>
            </RouterLink>
          </template>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 500px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
