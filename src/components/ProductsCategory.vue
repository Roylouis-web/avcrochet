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

// Helper to get the first image from the JSON string array
const getDisplayImage = (urlsData) => {
    if (!urlsData) return '';
    try {
        const images = typeof urlsData === 'string' ? JSON.parse(urlsData) : urlsData;
        return Array.isArray(images) && images.length > 0 ? images[0] : (typeof images === 'string' ? images : '');
    } catch (e) {
        return urlsData;
    }
};

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
            queries.push(Query.contains('name', searchParam));
        }

        // Apply Sorting
        if (currentSort.value === 'price-desc') queries.push(Query.orderDesc('price'));
        else if (currentSort.value === 'price-asc') queries.push(Query.orderAsc('price'));
        else if (currentSort.value === 'title-asc') queries.push(Query.orderAsc('name'));
        else if (currentSort.value === 'title-desc') queries.push(Query.orderDesc('name'));
        else if (currentSort.value === 'date-asc') queries.push(Query.orderAsc('$createdAt'));
        else queries.push(Query.orderDesc('$createdAt'));

        const response = await AppwriteService.getProducts(queries);
        const rows = response.rows || [];

        outfits.value = rows.map(row => ({
            id: row.$id,
            name: row.name,
            category: row.category,
            price: row.price,
            description: row.description || '',
            displayImage: getDisplayImage(row.urls || row.url)
        }));

        totalProducts.value = response.total;
    } catch (error) {
        console.error("Error fetching products:", error);
    } finally {
        loading.value = false;
    }
};

const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage));

const handlePageChange = (newPage) => {
    currentPage.value = newPage;
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch([() => route.params.category, () => route.query.q, currentSort], () => {
    currentPage.value = 1;
    fetchProducts();
});

onMounted(fetchProducts);
</script>

<template>
    <section>
        <header>
            <h1
                class="text-3xl font-semibold mb-3 border-b-2 border-[whitesmoke] text-center py-6 uppercase tracking-wider">
                {{ route.params.category ? route.params.category.replace(/-/g, ' ') : (route.query.q ? `Results for
                "${route.query.q}"` : 'Products') }}
            </h1>
        </header>

        <!-- Sort & Count -->
        <section
            class="flex justify-between items-center px-6 py-4 border-b-2 border-[whitesmoke] text-sm md:text-base">
            <div class="flex gap-3 items-center">
                <label for="sort" class="font-bold text-xs uppercase tracking-widest text-black">Sort By</label>
                <select v-model="currentSort" id="sort"
                    class="bg-transparent border-none focus:ring-0 cursor-pointer font-bold text-xs uppercase tracking-widest outline-none">
                    <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">{{ totalProducts }} products</p>
        </section>

        <!-- Grid -->
        <section
            class="mx-auto w-[95%] md:w-[85%] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-6 lg:gap-x-10 mt-12 mb-20">
            <template v-if="loading">
                <div v-for="n in 8" :key="n" class="animate-pulse">
                    <div class="bg-gray-100 rounded-[10px] aspect-[4/5] w-full"></div>
                    <div class="mt-4 space-y-3">
                        <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-100 rounded w-1/4"></div>
                    </div>
                </div>
            </template>

            <template v-else-if="outfits.length === 0">
                <div class="text-center col-span-full py-32 flex flex-col items-center justify-center">
                    <p class="text-xl md:text-2xl font-bold text-[#3A3A3A] uppercase tracking-[0.2em]">No products found
                    </p>
                    <p class="text-gray-400 text-sm mt-2 uppercase tracking-widest">Try adjusting your filters.</p>
                </div>
            </template>

            <template v-else>
                <div v-for="outfit in outfits" :key="outfit.id" class="group cursor-pointer">
                    <RouterLink :to="`/products/${outfit.category.toLowerCase().replace(/\s+/g, '-')}/${outfit.id}`">
                        <div class="overflow-hidden rounded-[10px] bg-gray-50 aspect-[4/5] border border-gray-100">
                            <img :src="outfit.displayImage" :alt="outfit.name"
                                class="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:opacity-90">
                        </div>
                        <div class="mt-4 text-left">
                            <p
                                class="font-bold hover:underline underline-offset-4 truncate text-sm lg:text-base text-[#3A3A3A] uppercase tracking-wide">
                                {{ outfit.name }}
                            </p>
                            <p class="text-gray-500 font-bold text-sm mt-1">₦{{ Number(outfit.price).toLocaleString() }}
                            </p>
                        </div>
                    </RouterLink>
                </div>
            </template>
        </section>

        <!-- Pagination -->
        <section v-if="!loading && totalPages > 1" class="flex justify-center items-center gap-8 mb-20">
            <button :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)"
                class="text-[10px] font-bold uppercase tracking-widest disabled:opacity-20 hover:underline underline-offset-8">
                PREV
            </button>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Page {{ currentPage }} / {{ totalPages }}
            </span>
            <button :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)"
                class="text-[10px] font-bold uppercase tracking-widest disabled:opacity-20 hover:underline underline-offset-8">
                NEXT
            </button>
        </section>
    </section>
</template>
