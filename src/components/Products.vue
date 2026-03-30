<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';
import { Query } from 'appwrite';

const route = useRoute();
const outfits = ref([]);
const loading = ref(true);
const isloadingMore = ref(false); // New state to track specific "Load More" action
const totalProducts = ref(0);
const currentSort = ref('date-desc');
const currentSubCategory = ref('');
const currentCategory = ref('');
const currentPriceRange = ref('');
const currentPage = ref(1);
const itemsPerPage = 12; // 12 items for perfect grid symmetry (2, 3, or 4 cols)

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

const fetchProducts = async (append = false) => {
    if (append) isloadingMore.value = true;
    else loading.value = true;

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

        const newItems = rows.map(row => {
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
                displayImage: getDisplayImage(row.urls || row.url)
            };
        });

        if (append) {
            outfits.value = [...outfits.value, ...newItems];
        } else {
            outfits.value = newItems;
        }
        totalProducts.value = response.total;
    } finally {
        loading.value = false;
        isloadingMore.value = false;
    }
};

const handleLoadMore = () => {
    currentPage.value++;
    fetchProducts(true);
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

watch([currentSort, currentSubCategory, currentCategory, currentPriceRange, () => route.query.q], () => {
    currentPage.value = 1;
    fetchProducts(false); // Reset to first page on filter change
});

onMounted(() => fetchProducts(false));
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
            class="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-b-2 border-[whitesmoke] gap-4 bg-white">
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
            class="mx-auto w-[95%] md:w-[85%] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-6 lg:gap-x-10 m-12">
            <template v-if="loading && outfits.length === 0">
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
                <div v-for="outfit in displayOutfits" :key="outfit.id" v-memo="[outfit.id, outfit.displayImage]"
                    class="group cursor-pointer">
                    <div class="relative overflow-hidden rounded-[10px] aspect-[4/5] bg-gray-50">
                        <img :src="outfit.displayImage" :alt="outfit.name" loading="lazy"
                            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div class="mt-4 space-y-1">
                        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{{ outfit.category
                            }}</h3>
                        <p class="text-sm font-bold uppercase text-[#3A3A3A] truncate">{{ outfit.name }}</p>
                        <p class="text-sm font-black text-[12px] text-gray-500">₦{{ outfit.price.toLocaleString() }}</p>
                    </div>
                </div>
            </template>
        </section>

        <!-- Load More Section -->
        <div v-if="outfits.length < totalProducts" class="flex justify-center mt-20 mb-32">
            <button @click="handleLoadMore" :disabled="isloadingMore"
                class="border-2 border-black px-16 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500 disabled:opacity-30">
                {{ isloadingMore ? 'Loading...' : 'Load More' }}
            </button>
        </div>
    </section>
</template>