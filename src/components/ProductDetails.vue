<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const route = useRoute();
const router = useRouter();

const product = ref(null);
const loading = ref(true);
const isAdding = ref(false);
const currentUser = ref(null);
const activeImageIndex = ref(0);
const showToast = ref(false);
const showDeleteModal = ref(false);

const quantity = ref(1);
const selectedSize = ref('');
const sizeError = ref(false);

const isAdmin = computed(() => currentUser.value?.role === 'admin');

// FIX: Access object by key directly instead of .find()
const currentPrice = computed(() => {
    if (!product.value?.parsedSizes || !selectedSize.value) return 0;
    return Number(product.value.parsedSizes[selectedSize.value]) || 0;
});

// FIX: Use Object.keys() since parsedSizes is now a JSON object mapping
const availableSizes = computed(() => {
    if (!product.value?.parsedSizes) return [];
    return Object.keys(product.value.parsedSizes);
});

const getPrimaryImageUrl = () => {
    if (!product.value?.urls) return '';
    try {
        const images = typeof product.value.urls === 'string' ? JSON.parse(product.value.urls) : product.value.urls;
        return Array.isArray(images) && images.length > 0 ? images[0] : '';
    } catch (e) { return product.value.urls; }
};

const fetchData = async () => {
    loading.value = true;
    try {
        currentUser.value = await AppwriteService.getFullUser();
        const response = await AppwriteService.getProduct(route.params.id);
        if (response) {
            let parsedUrls = [], parsedSizes = {};
            try {
                parsedUrls = typeof response.urls === 'string' ? JSON.parse(response.urls) : [];
            } catch (e) { parsedUrls = [response.urls]; }

            try {
                // FIX: Parse as Object mapping, not Array
                parsedSizes = typeof response.sizes === 'string' ? JSON.parse(response.sizes) : (response.sizes || {});
            } catch (e) { parsedSizes = {}; }

            product.value = { ...response, parsedUrls, parsedSizes };

            // FIX: Check for 'M' key existence instead of .some()
            const sizesKeys = Object.keys(parsedSizes);
            if (parsedSizes['M'] !== undefined) {
                selectedSize.value = 'M';
            } else if (sizesKeys.length > 0) {
                selectedSize.value = sizesKeys[0];
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

const handleAddToCart = async () => {
    if (!selectedSize.value) { sizeError.value = true; return; }
    isAdding.value = true;
    try {
        if (!currentUser.value) { router.push('/login'); return; }
        const cartData = {
            userId: currentUser.value.$id,
            productId: product.value.$id || product.value.id,
            name: product.value.name,
            price: currentPrice.value,
            url: getPrimaryImageUrl(),
            quantity: quantity.value,
            size: selectedSize.value
        };
        await AppwriteService.addToCart(cartData);
        showToast.value = true;
        setTimeout(() => { showToast.value = false; }, 3000);
    } catch (error) {
        console.error(error);
    } finally {
        isAdding.value = false;
    }
};

const confirmDelete = async () => {
    try {
        await AppwriteService.deleteProduct(product.value.$id || product.value.id);
        router.push('/products');
    } catch (error) {
        console.error("Delete failed", error);
    }
};
</script>

<template>
    <!-- TOAST NOTIFICATION -->
    <Transition name="fade">
        <div v-if="showToast"
            class="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-8 py-4 rounded-sm shadow-2xl flex items-center gap-4 border border-gray-800">
            <span class="text-green-400">✓</span>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em]">Added to your cart</p>
        </div>
    </Transition>

    <!-- CUSTOM DELETE MODAL -->
    <Transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteModal = false"></div>
            <div class="relative bg-white p-8 md:p-12 max-w-sm w-full text-center shadow-2xl">
                <h3 class="text-lg font-bold uppercase tracking-tighter mb-4 text-black">Remove Product?</h3>
                <p class="text-xs text-gray-500 uppercase tracking-widest leading-relaxed mb-8">This action cannot be
                    undone. Are you sure you want to delete this piece?</p>
                <div class="flex flex-col gap-3">
                    <button @click="confirmDelete"
                        class="bg-red-600 text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-700 transition">Delete
                        Permanently</button>
                    <button @click="showDeleteModal = false"
                        class="text-[10px] font-bold uppercase tracking-[0.2em] py-2 text-gray-400 hover:text-black transition">Cancel</button>
                </div>
            </div>
        </div>
    </Transition>

    <section v-if="!loading && product" class="mx-auto w-[90%] md:w-[85%] mt-12 mb-20 text-left">
        <div class="flex flex-col md:flex-row gap-10 lg:gap-24 items-start justify-center">

            <!-- Gallery -->
            <div class="w-full md:w-[40%] max-w-[450px] shrink-0">
                <div class="overflow-hidden rounded-[10px] bg-gray-50 aspect-square mb-4 border">
                    <img :src="product.parsedUrls[activeImageIndex]"
                        class="w-full h-full object-cover transition-transform duration-700 hover:scale-105">
                </div>
                <div v-if="product.parsedUrls.length > 1" class="flex gap-2 overflow-x-auto pb-2">
                    <div v-for="(img, idx) in product.parsedUrls" :key="idx" @click="activeImageIndex = idx"
                        class="w-16 h-16 rounded-md cursor-pointer border-2 overflow-hidden shrink-0 transition-all"
                        :class="activeImageIndex === idx ? 'border-black' : 'border-gray-100 opacity-60'">
                        <img :src="img" class="w-full h-full object-cover">
                    </div>
                </div>
            </div>

            <!-- Details -->
            <div class="flex flex-col gap-6 md:w-1/2 pt-1">
                <div class="space-y-2">
                    <div class="flex justify-between items-start gap-4">
                        <h2 class="text-xl md:text-3xl font-bold text-[#3A3A3A] uppercase tracking-wider">{{
                            product.name }}</h2>
                        <!-- ADMIN ACTIONS -->
                        <div v-if="isAdmin" class="flex gap-4">
                            <RouterLink :to="`/products/edit/${product.$id || product.id}`"
                                class="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black underline">
                                Edit</RouterLink>
                            <button @click="showDeleteModal = true"
                                class="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 underline">Delete</button>
                        </div>
                    </div>
                    <p class="text-lg md:text-xl font-medium text-gray-600">₦{{ currentPrice.toLocaleString() }}</p>
                </div>

                <div class="text-sm text-gray-500 leading-relaxed max-w-md">
                    <p>{{ product.description }}</p>
                </div>

                <div v-if="!isAdmin" class="flex flex-col gap-6 py-6 border-y border-gray-100 mt-4 max-w-[320px]">
                    <!-- Size Selector -->
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-black flex justify-between">
                            Select Size <span v-if="sizeError"
                                class="text-red-500 lowercase font-normal italic">Required*</span>
                        </label>
                        <select v-model="selectedSize" @change="sizeError = false"
                            class="border border-gray-200 h-12 px-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-colors bg-white cursor-pointer"
                            :class="{ 'border-red-500': sizeError }">
                            <option v-for="size in availableSizes" :key="size" :value="size">{{ size }}</option>
                        </select>
                    </div>

                    <!-- Quantity -->
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-black">Quantity</label>
                        <div class="flex border border-gray-200 h-12 w-32 items-center">
                            <button @click="quantity > 1 ? quantity-- : null"
                                class="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black transition">-</button>
                            <input type="number" v-model="quantity" readonly
                                class="w-12 h-full text-center text-xs font-bold border-none focus:ring-0">
                            <button @click="quantity++"
                                class="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black transition">+</button>
                        </div>
                    </div>

                    <button @click="handleAddToCart" :disabled="isAdding"
                        class="bg-black text-white h-14 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition disabled:bg-gray-400">
                        {{ isAdding ? 'Processing...' : 'Add to Cart' }}
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
