<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';
import { Query } from 'appwrite';

const route = useRoute();
const outfits = ref([]);
const loading = ref(true);
const totalProducts = ref(0);
const currentSort = ref('date-desc');
const currentPage = ref(1);
const itemsPerPage = 20;

const sortOptions = [
    { label: 'Date, new to old', value: 'date-desc' },
    { label: 'Date, old to new', value: 'date-asc' },
    { label: 'Price, high to low', value: 'price-desc' },
    { label: 'Price, low to high', value: 'price-asc' },
    { label: 'Alphabetically, A-Z', value: 'title-asc' },
    { label: 'Alphabetically, Z-A', value: 'title-desc' }
];

const fetchProducts = async () => {
    loading.value = true;
    try {
        const categoryParam = route.params.category?.replace(/-/g, ' ') || '';
        const searchParam = route.query.q || '';
        const queries = [
            Query.limit(itemsPerPage),
            Query.offset((currentPage.value - 1) * itemsPerPage)
        ];

        if (categoryParam) {
            queries.push(Query.equal('category', categoryParam));
        }

        if (searchParam) {
            queries.push(Query.search('name', searchParam));
        }

        const response = await AppwriteService.getProducts(queries);
        const rows = response.rows || [];

        outfits.value = rows.map(row => ({
            id: row.$id,
            name: row.name,
            category: row.category,
            price: row.price,
            description: row.description || '',
            url: row.url
        }));

        totalProducts.value = response.total;
    } catch (error) {
        console.error("Error fetching products:", error);
    } finally {
        loading.value = false;
    }
};

watch([() => route.params.category, () => route.query.q, currentSort], fetchProducts);

onMounted(fetchProducts);
const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage));
</script>

<template>
    <section>
        <header>
            <h1 class="text-3xl font-semibold mb-3 border-b-2 border-[whitesmoke] text-center py-6 capitalize">
                {{ route.params.category ? route.params.category.replace(/-/g, ' ') : (route.query.q ? `Results for
                "${route.query.q}"` : 'Products') }}
            </h1>
        </header>

        <section
            class="flex justify-between items-center px-6 py-4 border-b-2 border-[whitesmoke] text-sm md:text-base">
            <div class="flex gap-3 items-center">
                <label for="sort" class="font-bold text-xs uppercase tracking-widest text-black">Sort By</label>
                <select v-model="currentSort" id="sort"
                    class="bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-sm text-[#3A3A3A]">
                    <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
            <p class="text-gray-500 font-medium">{{ totalProducts }} products</p>
        </section>

        <section
            class="mx-auto w-[95%] md:w-[85%] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 gap-x-6 lg:gap-x-10 mt-12">
            <!-- Skeleton Loading -->
            <template v-if="loading">
                <div v-for="n in 8" :key="n" class="animate-pulse">
                    <div class="bg-gray-200 rounded-[10px] aspect-[4/5] w-full"></div>
                    <div class="mt-4 space-y-2">
                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            </template>

            <!-- No Products Found -->
            <template v-else-if="outfits.length === 0">
                <div
                    class="text-center col-span-full py-32 flex flex-col items-center justify-center border-y border-[whitesmoke] my-12">
                    <p class="text-2xl md:text-3xl font-semibold text-[#3A3A3A] uppercase tracking-[0.2em] mb-4">No
                        products found</p>
                    <p class="text-gray-400 text-sm md:text-base font-medium tracking-wide">Try adjusting your filters
                        or browsing all collections.</p>
                </div>
            </template>

            <!-- Product Cards -->
            <template v-else>
                <div v-for="outfit in outfits" :key="outfit.id" class="group cursor-pointer">
                    <RouterLink :to="`/products/${outfit.category.toLowerCase().replace(/\s+/g, '-')}/${outfit.id}`">
                        <div class="overflow-hidden rounded-[10px] bg-gray-50">
                            <!-- Show the first outfit image if available -->
                            <img :src="outfit.url" :alt="outfit.name"
                                class="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:opacity-90">
                        </div>
                        <div class="mt-4">
                            <p class="font-bold hover:underline underline-offset-4 truncate lg:text-xl text-[#3A3A3A]">
                                {{ outfit.name }}</p>
                            <p class="text-gray-600 font-medium">₦{{ outfit.price }}</p>
                        </div>
                    </RouterLink>
                </div>
            </template>
        </section>

        <!-- Pagination Controls -->
        <section class="flex justify-center items-center gap-4 mt-6">
            <button :disabled="currentPage === 1" @click="currentPage-- && fetchProducts()"
                class="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
            </button>

            <span>Page {{ currentPage }} of {{ totalPages }}</span>

            <button :disabled="currentPage === totalPages" @click="currentPage++ && fetchProducts()"
                class="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </section>
    </section>
</template>
