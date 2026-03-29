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
const currentCategory = ref('');
const currentPriceRange = ref('');
const currentPage = ref(1);
const itemsPerPage = 20;

// Filter options
const subCategoryOptions = [{ label: 'All Targets', value: '' }, { label: 'Women', value: 'Women' }, { label: 'Men', value: 'Men' }, { label: 'Kids', value: 'Kids' }, { label: 'Unisex', value: 'Unisex' }];
const categoryOptions = [{ label: 'All Categories', value: '' }, { label: 'Beanies', value: 'Beanies' }, { label: 'Bucket Hats', value: 'Bucket Hats' }, { label: 'Gowns', value: 'Gowns' }, { label: 'Dresses', value: 'Dresses' }, { label: 'Bikinis', value: 'Bikinis' }];
const priceOptions = [{ label: 'All Prices', value: '' }, { label: 'Under ₦10k', value: '0-10000' }, { label: '₦10k - ₦30k', value: '10000-30000' }, { label: '₦30k - ₦50k', value: '30000-50000' }, { label: 'Over ₦50k', value: '50000-999999' }];
const sortOptions = [{ label: 'Newest First', value: 'date-desc' }, { label: 'Oldest First', value: 'date-asc' }, { label: 'Price: Low-High', value: 'price-asc' }, { label: 'Price: High-Low', value: 'price-desc' }, { label: 'Name: A-Z', value: 'title-asc' }];

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
        const queries = [Query.limit(itemsPerPage), Query.offset((currentPage.value - 1) * itemsPerPage)];
        const searchQuery = route.query.q;
        if (searchQuery?.trim()) queries.push(Query.contains('name', searchQuery));
        if (currentSubCategory.value) queries.push(Query.equal('subCategory', currentSubCategory.value));
        if (currentCategory.value) queries.push(Query.equal('category', currentCategory.value));

        if (currentSort.value === 'title-asc') queries.push(Query.orderAsc('name'));
        else if (currentSort.value === 'date-asc') queries.push(Query.orderAsc('$createdAt'));
        else queries.push(Query.orderDesc('$createdAt'));

        const response = await AppwriteService.getProducts(queries);
        const rows = response.documents || response.rows || [];

        // STABILIZE DATA: Process everything here once
        outfits.value = rows.map(row => {
            let mPrice = 0;
            try {
                const sizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes;
                mPrice = sizes?.['XS'] || sizes?.['M'] || 0;
            } catch (e) { }

            return {
                id: row.$id,
                name: row.name,
                category: row.category,
                price: mPrice,
                // Image is now a fixed string, not a function call
                displayImage: getDisplayImage(row.urls || row.url)
            };
        });
        totalProducts.value = response.total;
    } finally {
        loading.value = false;
    }
};

const displayOutfits = computed(() => {
    let list = [...outfits.value];
    if (currentPriceRange.value) {
        const [min, max] = currentPriceRange.value.split('-').map(Number);
        list = list.filter(item => item.price >= min && item.price <= max);
    }
    if (currentSort.value === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (currentSort.value === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
});

// Guarded watcher to prevent scroll-triggered fetches
watch([currentSort, currentSubCategory, currentCategory, currentPriceRange, () => route.query.q], (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        currentPage.value = 1;
        fetchProducts();
    }
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

        <!-- Tool Bar -->
        <section
            class="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-b-2 border-[whitesmoke] gap-4 bg-white sticky top-0 z-20">
            <div class="flex flex-wrap gap-6 items-center justify-center">
                <div class="flex items-center gap-2">
                    <label class="font-bold text-[10px] uppercase text-gray-400">Target</label>
                    <select v-model="currentSubCategory"
                        class="bg-transparent border-none text-[10px] font-black uppercase focus:ring-0 p-0 cursor-pointer">
                        <option v-for="opt in subCategoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}
                        </option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <label class="font-bold text-[10px] uppercase text-gray-400">Category</label>
                    <select v-model="currentCategory"
                        class="bg-transparent border-none text-[10px] font-black uppercase focus:ring-0 p-0 cursor-pointer">
                        <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}
                        </option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <label class="font-bold text-[10px] uppercase text-gray-400">Price</label>
                    <select v-model="currentPriceRange"
                        class="bg-transparent border-none text-[10px] font-black uppercase focus:ring-0 p-0 cursor-pointer">
                        <option v-for="opt in priceOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <label class="font-bold text-[10px] uppercase text-gray-400">Sort</label>
                    <select v-model="currentSort"
                        class="bg-transparent border-none text-[10px] font-black uppercase focus:ring-0 p-0 cursor-pointer">
                        <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                </div>
            </div>
            <p class="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {{ totalProducts }} products
            </p>
        </section>

        <!-- Product Grid -->
        <section
            class="mx-auto w-[95%] md:w-[85%] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-6 lg:gap-x-10 mt-12 mb-20">
            <template v-if="loading">
                <div v-for="n in 8" :key="n" class="animate-pulse bg-gray-100 rounded-[10px] aspect-[4/5]"></div>
            </template>

            <template v-else-if="displayOutfits.length === 0">
                <div class="text-center col-span-full py-32">
                    <p class="text-xl font-bold text-[#3A3A3A] uppercase tracking-[0.2em]">No products found</p>
                    <button @click="currentSubCategory = ''; currentCategory = ''; currentPriceRange = ''"
                        class="text-[#D4AF37] text-xs mt-4 underline uppercase font-bold">Reset Filters</button>
                </div>
            </template>

            <template v-else>
                <!-- v-memo stops the card from re-rendering unless the data actually changes -->
                <div v-for="outfit in displayOutfits" :key="outfit.id" v-memo="[outfit.id, outfit.displayImage]"
                    class="group cursor-pointer">
                    <RouterLink :to="`/products/${outfit.category.toLowerCase().replace(/\s+/g, '-')}/${outfit.id}`">
                        <div
                            class="overflow-hidden rounded-[10px] bg-gray-50 aspect-[4/5] border border-gray-100 relative">
                            <!-- Removed loading="lazy" to keep images persistent in memory -->
                            <img :src="outfit.displayImage" :alt="outfit.name" decoding="async"
                                class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                        </div>
                        <div class="mt-4 text-left">
                            <p class="font-bold hover:underline underline-offset-4 truncate text-sm uppercase">{{
                                outfit.name }}</p>
                            <p class="text-gray-500 font-bold text-[11px] mt-1 tracking-widest uppercase">₦{{
                                outfit.price }}</p>
                        </div>
                    </RouterLink>
                </div>
            </template>
        </section>

        <!-- Pagination -->
        <div v-if="totalProducts > itemsPerPage" class="flex justify-center gap-4 mb-20">
            <button :disabled="currentPage === 1" @click="currentPage--; fetchProducts()"
                class="px-6 py-2 border font-bold uppercase text-[10px] tracking-widest disabled:opacity-30">Prev</button>
            <span class="flex items-center text-[10px] font-bold uppercase">Page {{ currentPage }}</span>
            <button :disabled="currentPage * itemsPerPage >= totalProducts" @click="currentPage++; fetchProducts()"
                class="px-6 py-2 border font-bold uppercase text-[10px] tracking-widest disabled:opacity-30">Next</button>
        </div>
    </section>
</template>
