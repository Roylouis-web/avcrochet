<!-- src/layouts/DefaultLayout.vue -->
<script setup>
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<!-- src/layouts/DefaultLayout.vue -->
<template>
  <!-- This grid structure pins the footer to the bottom even if the page is empty -->
  <div class="min-h-screen grid grid-rows-[auto_1fr_auto]">
    <Header />

    <!-- The '1fr' row forces this main area to fill all available space -->
    <main class="w-full">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>
