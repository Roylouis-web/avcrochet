<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import AppwriteService from '@/services/AppwriteService'
import { Query } from 'appwrite'

const productsRef = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const observerTarget = ref(null)
const totalCount = ref(0)
const itemsPerPage = 4

const hasMore = computed(() => {
  if (loading.value && productsRef.value.length === 0) return false
  return productsRef.value.length < totalCount.value
})

const getDisplayImage = (product) => {
  if (!product.urls) return null;
  try {
    const images = typeof product.urls === 'string' ? JSON.parse(product.urls) : product.urls;
    return Array.isArray(images) && images.length > 0 ? images[0] : (typeof images === 'string' ? images : null);
  } catch (e) { return product.urls; }
}

const fetchProducts = async () => {
  if (loadingMore.value || (productsRef.value.length > 0 && !hasMore.value)) return
  const isInitial = productsRef.value.length === 0
  if (!isInitial) loadingMore.value = true

  try {
    const response = await AppwriteService.getProducts([
      Query.limit(itemsPerPage),
      Query.offset(productsRef.value.length),
      Query.orderDesc('$createdAt')
    ]);
    const documents = response.documents || [];
    const existingCategories = new Set(productsRef.value.map(p => p.category));

    const uniqueProducts = documents.filter(p => !existingCategories.has(p.category))
      .map(p => ({ ...p, displayImage: getDisplayImage(p) }));

    productsRef.value.push(...uniqueProducts);
    totalCount.value = response.total || 0;
  } catch (error) { console.error(error); } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

let observer = null;
onMounted(() => {
  fetchProducts();
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !loading.value && hasMore.value) fetchProducts();
  }, { rootMargin: '200px' });
  watch(observerTarget, (el) => { if (el) observer.observe(el) });
});
onUnmounted(() => { if (observer) observer.disconnect() });
</script>

<template>
  <div class="bg-white flex flex-col my-16 gap-16 min-h-screen">
    <template v-if="loading && productsRef.length === 0">
      <div v-for="n in 4" :key="n" class="mx-auto lg:ml-40 w-[90%] sm:w-[65%] lg:w-[40%] animate-pulse">
        <div class="h-8 bg-gray-100 w-48 mb-6 rounded"></div>
        <div class="aspect-square bg-gray-100 w-full rounded-[10px]"></div>
      </div>
    </template>

    <template v-else-if="!loading && productsRef.length === 0">
      <section class="flex flex-col items-center justify-center py-40 text-center">
        <h2 class="text-2xl font-black uppercase tracking-[0.3em] mb-4">No Collections Found</h2>
        <RouterLink to="/products"
          class="mt-10 border-2 border-black py-4 px-10 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
          Browse All Products
        </RouterLink>
      </section>
    </template>

    <template v-else>
      <TransitionGroup name="list" tag="div" class="flex flex-col gap-16">
        <figure v-for="product in productsRef" :key="product.$id"
          class="mx-auto lg:mx-0 lg:ml-40 w-[90%] sm:w-[65%] lg:w-[40%] max-w-[450px] flex flex-col gap-6 group">
          <h1 class="text-3xl font-bold uppercase tracking-tight">{{ product.category }}</h1>
          <div
            class="overflow-hidden rounded-[10px] bg-gray-50 aspect-square w-full border flex items-center justify-center">
            <img v-if="product.displayImage" :src="product.displayImage"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div v-else class="text-center p-8">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Image coming soon</p>
            </div>
          </div>
          <RouterLink
            class="inline-block border-2 border-black py-3 px-8 w-max text-xs font-bold tracking-widest hover:bg-black hover:text-white transition-all uppercase"
            :to="`/products/${product.category.toLowerCase().replace(/\s+/g, '-')}`">
            VIEW COLLECTION
          </RouterLink>
        </figure>
      </TransitionGroup>
    </template>
    <div ref="observerTarget" class="h-32 flex flex-col items-center justify-center">
      <div v-if="loadingMore" class="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full">
      </div>
    </div>
  </div>
</template>
