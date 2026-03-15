<!-- src/layouts/DefaultLayout.vue -->
<script setup>
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <section class="flex flex-col min-h-screen">
    <Header />
    <RouterView class="grow"/>
    <Footer />
  </section>
</template>