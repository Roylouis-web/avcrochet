<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import AppwriteService from '@/services/AppwriteService'
import { Query } from 'appwrite'

const productsRef = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const observerTarget = ref(null)
const totalCount = ref(0)
const itemsPerPage = 4 // Increased for better fill

const hasMore = computed(() => {
  if (loading.value && productsRef.value.length === 0) return false
  return productsRef.value.length < totalCount.value
})

const fetchProducts = async () => {
  if (loadingMore.value || (productsRef.value.length > 0 && !hasMore.value)) return

  const isInitial = productsRef.value.length === 0
  if (!isInitial) loadingMore.value = true

  try {
    const response = await AppwriteService.getProducts([
      Query.limit(itemsPerPage),
      Query.offset(productsRef.value.length),
      Query.orderDesc('$createdAt')
    ])

    const documents = response.documents || []

    // UNIQUE CATEGORY FILTER: Ensure we only show one of each category
    const existingCategories = new Set(productsRef.value.map(p => p.category))
    const uniqueProducts = documents.filter(product => {
      if (existingCategories.has(product.category)) {
        return false
      } else {
        existingCategories.add(product.category)
        return true
      }
    })

    productsRef.value.push(...uniqueProducts)
    totalCount.value = response.total || 0
  } catch (error) {
    console.error("Fetch error:", error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

let observer = null

onMounted(() => {
  fetchProducts()
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading.value && !loadingMore.value && hasMore.value) {
      fetchProducts()
    }
  }, { rootMargin: '200px' })

  watch(observerTarget, (el) => {
    if (el) observer.observe(el)
  })
})

onUnmounted(() => { if (observer) observer.disconnect() })
</script>

<template>
  <div class="bg-white flex flex-col my-16 gap-16 min-h-screen">

    <!-- Skeletons -->
    <!-- Match the number of skeletons to your typical 'itemsPerPage' (4) -->
    <template v-if="loading && productsRef.length === 0">
      <div class="flex flex-col gap-16">
        <div v-for="n in 4" :key="n" class="mx-auto lg:ml-40 w-[90%] sm:w-[65%] lg:w-[40%] animate-pulse">
          <div class="h-8 bg-gray-100 w-48 mb-6 rounded"></div>
          <div class="aspect-square bg-gray-100 w-full rounded-[10px]"></div>
        </div>
      </div>
    </template>


    <!-- Content -->
    <template v-else-if="productsRef.length > 0">
      <TransitionGroup name="list" tag="div" appear class="flex flex-col gap-16"
        enter-active-class="transition duration-700 ease-out" enter-from-class="opacity-0 translate-y-10"
        enter-to-class="opacity-100 translate-y-0">
        <!-- FIX: Keyed child for TransitionGroup -->
        <figure v-for="product in productsRef" :key="product.$id"
          class="mx-auto lg:mx-0 lg:ml-40 w-[90%] sm:w-[65%] lg:w-[40%] max-w-[450px] flex flex-col gap-6 group">
          <h1 class="text-3xl lg:text-4xl font-bold text-[#3A3A3A] uppercase tracking-tight">
            {{ product.category }}
          </h1>
          <div class="overflow-hidden rounded-[10px] bg-gray-50 aspect-square w-full border border-gray-100">
            <img v-if="product.url" :src="product.url" :alt="product.category"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 italic">No Image</div>
          </div>
          <RouterLink
            class="inline-block border-2 border-black py-3 px-8 w-max text-xs font-bold tracking-widest hover:bg-black hover:text-white transition-all"
            :to="`/products?q=${product.category}`">
            VIEW COLLECTION
          </RouterLink>
        </figure>
      </TransitionGroup>
    </template>

    <!-- Sentinel -->
    <div ref="observerTarget" class="h-32 flex flex-col items-center justify-center">
      <div v-if="loadingMore" class="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full">
      </div>
      <p v-if="!hasMore && productsRef.length > 0"
        class="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        End of Collection</p>
    </div>
  </div>
</template>

<style scoped>
.list-move {
  transition: transform 0.5s ease;
}
</style>
