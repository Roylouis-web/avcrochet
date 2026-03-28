<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';
import { Query } from 'appwrite';

const route = useRoute();
const outfits = ref([]);
const loading = ref(true);
const totalProducts = ref(0);
const currentSort = ref('date-desc');
const currentSubCategory = ref('');
const currentCategory = ref(''); // New Category state
const currentPage = ref(1);
const itemsPerPage = 20;

const subCategoryOptions = [
    { label: 'All Targets', value: '' },
    { label: 'Women', value: 'Women' },
    { label: 'Men', value: 'Men' },
    { label: 'Kids', value: 'Kids' },
    { label: 'Unisex', value: 'Unisex' }
];

const categoryOptions = [
    { label: 'All Categories', value: '' },
    { label: 'Utility Items', value: 'Utility Items' },
    { label: 'Seasonal Items', value: 'Seasonal Items' },
    { label: 'Keychains & Charms', value: 'Keychains & Charms' },
    { label: 'Home Decor', value: 'Home Decor' },
    { label: 'Bags & Purses', value: 'Bags & Purses' },
    { label: 'Jewelry', value: 'Jewelry' },
    { label: 'Hair Accessories', value: 'Hair Accessories' },
    { label: 'Hoodies', value: 'Hoodies' },
    { label: 'Sweaters', value: 'Sweaters' },
    { label: 'Skirts', value: 'Skirts' },
    { label: 'Dresses', value: 'Dresses' },
    { label: 'Tops', value: 'Tops' },
    { label: 'Shorts', value: 'Shorts' },
    { label: 'Beach wear', value: 'Beach wear' },
    { label: 'Bikini', value: 'Bikini' },
    { label: 'Trousers', value: 'Trousers' },
    { label: 'T-shirt', value: 'T-shirt' },
    { label: 'Vest', value: 'Vest' },
    { label: 'Jumpsuit', value: 'Jumpsuit' },
    { label: 'Hat', value: 'Hat' },
    { label: 'Two-Pieces', value: 'Two-Pieces' }
];

const sortOptions = [
    { label: 'Newest First', value: 'date-desc' },
    { label: 'Oldest First', value: 'date-asc' },
    { label: 'Price: High-Low', value: 'price-desc' },
    { label: 'Price: Low-High', value: 'price-asc' },
    { label: 'Name: A-Z', value: 'title-asc' }
];

const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage));

const getDisplayImage = (urlsData) => {
    if (!urlsData) return '';
    try {
        const images = typeof urlsData === 'string' ? JSON.parse(urlsData) : urlsData;
        return Array.isArray(images) && images.length > 0 ? images[0] : (typeof images === 'string' ? images : '');
    } catch (e) { return urlsData; }
};

const fetchProducts = async () => {
    loading.value = true;
    try {
        const queries = [
            Query.limit(itemsPerPage),
            Query.offset((currentPage.value - 1) * itemsPerPage)
        ];

        const searchQuery = route.query.q;
        if (searchQuery?.trim()) queries.push(Query.contains('name', searchQuery));

        // Dynamic Filters
        if (currentSubCategory.value) queries.push(Query.equal('subCategory', currentSubCategory.value));
        if (currentCategory.value) queries.push(Query.equal('category', currentCategory.value));

        // Sort Logic
        if (currentSort.value === 'price-desc') queries.push(Query.orderDesc('price'));
        else if (currentSort.value === 'price-asc') queries.push(Query.orderAsc('price'));
        else if (currentSort.value === 'title-asc') queries.push(Query.orderAsc('name'));
        else if (currentSort.value === 'date-asc') queries.push(Query.orderAsc('$createdAt'));
        else queries.push(Query.orderDesc('$createdAt'));

        const response = await AppwriteService.getProducts(queries);
        const rows = response.documents || response.rows || [];

        outfits.value = rows.map(row => ({
            id: row.$id,
            name: row.name,
            category: row.category,
            price: row.price,
            displayImage: getDisplayImage(row.urls || row.url)
        }));

        totalProducts.value = response.total;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

watch([currentSort, currentSubCategory, currentCategory, () => route.query.q], () => {
    currentPage.value = 1;
    fetchProducts();
});

onMounted(fetchProducts);
</script>

<template>
    <section class="bg-white min-h-screen">
        <header>
            <h1
                class="text-3xl font-semibold mb-3 border-b-2 border-[whitesmoke] text-center py-6 uppercase tracking-wider">
                {{ route.query.q ? `Results for "${route.query.q}"` : 'All Products' }}
            </h1>
        </header>

        <!-- Tool Bar: Filters + Sort -->
        <section
            class="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-b-2 border-[whitesmoke] gap-4 bg-white sticky top-0 z-20">

            <div class="flex flex-wrap gap-6 items-center justify-center">
                <!-- Target Dropdown -->
                <div class="flex items-center gap-2">
                    <label class="font-bold text-[10px] uppercase tracking-widest text-gray-400">Target</label>
                    <select v-model="currentSubCategory"
                        class="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer outline-none hover:text-black">
                        <option v-for="opt in subCategoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}
                        </option>
                    </select>
                </div>

                <!-- Category Dropdown -->
                <div class="flex items-center gap-2">
                    <label class="font-bold text-[10px] uppercase tracking-widest text-gray-400">Category</label>
                    <select v-model="currentCategory"
                        class="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer outline-none hover:text-black">
                        <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}
                        </option>
                    </select>
                </div>

                <!-- Sort Dropdown -->
                <div class="flex items-center gap-2">
                    <label class="font-bold text-[10px] uppercase tracking-widest text-gray-400">Sort</label>
                    <select v-model="currentSort"
                        class="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer outline-none hover:text-black">
                        <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                </div>
            </div>

            <p
                class="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-l-0 md:border-l md:pl-6 border-gray-200">
                {{ totalProducts }} products
            </p>
        </section>

        <!-- Product Grid -->
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
                <div class="text-center col-span-full py-32">
                    <p class="text-xl font-bold text-[#3A3A3A] uppercase tracking-[0.2em]">No products found</p>
                    <button @click="currentSubCategory = ''; currentCategory = ''"
                        class="text-[#D4AF37] text-xs mt-4 underline uppercase font-bold">Reset Filters</button>
                </div>
            </template>

            <template v-else>
                <div v-for="outfit in outfits" :key="outfit.id" class="group cursor-pointer">
                    <RouterLink :to="`/products/${outfit.category.toLowerCase().replace(/\s+/g, '-')}/${outfit.id}`">
                        <div
                            class="overflow-hidden rounded-[10px] bg-gray-50 aspect-[4/5] border border-gray-100 relative">
                            <img :src="outfit.displayImage" :alt="outfit.name"
                                class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                        </div>
                        <div class="mt-4 text-left">
                            <p
                                class="font-bold hover:underline underline-offset-4 truncate text-sm uppercase tracking-wide">
                                {{ outfit.name }}</p>
                            <p class="text-gray-500 font-bold text-sm mt-1 italic">₦{{
                                Number(outfit.price).toLocaleString() }}</p>
                        </div>
                    </RouterLink>
                </div>
            </template>
        </section>

        <!-- Pagination -->
        <footer v-if="!loading && totalPages > 1" class="flex justify-center items-center gap-12 mb-32">
            <button :disabled="currentPage === 1"
                @click="currentPage--; fetchProducts(); window.scrollTo({ top: 0, behavior: 'smooth' })"
                class="text-[10px] font-bold uppercase tracking-[0.3em] disabled:opacity-20 hover:text-[#D4AF37]">
                &larr; Prev
            </button>
            <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">
                {{ currentPage }} / {{ totalPages }}
            </span>
            <button :disabled="currentPage === totalPages"
                @click="currentPage++; fetchProducts(); window.scrollTo({ top: 0, behavior: 'smooth' })"
                class="text-[10px] font-bold uppercase tracking-[0.3em] disabled:opacity-20 hover:text-[#D4AF37]">
                Next &rarr;
            </button>
        </footer>
    </section>
</template>
