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
const showToast = ref(false); // Toast state

const isAdmin = computed(() => {
    return currentUser.value?.role === 'admin';
});

// Returns the first image URL from the JSON string array
const getPrimaryImageUrl = () => {
    if (!product.value?.urls) return '';
    try {
        const images = typeof product.value.urls === 'string' ? JSON.parse(product.value.urls) : product.value.urls;
        return Array.isArray(images) && images.length > 0 ? images[0] : '';
    } catch (e) {
        return product.value.urls;
    }
};

const fetchData = async () => {
    loading.value = true;
    try {
        currentUser.value = await AppwriteService.getFullUser();
        const productId = route.params.id;
        const response = await AppwriteService.getProduct(productId);

        if (response) {
            let parsedUrls = [];
            try {
                parsedUrls = typeof response.urls === 'string' ? JSON.parse(response.urls) : [];
            } catch (e) {
                parsedUrls = [response.urls];
            }
            product.value = { ...response, parsedUrls };
        }
    } catch (error) {
        console.error("Data fetch failed:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

const triggerToast = () => {
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 3000); // Hide after 3 seconds
};

const handleAddToCart = async () => {
    if (!product.value?.id) return;
    isAdding.value = true;
    try {
        if (!currentUser.value) {
            router.push('/login');
            return;
        }

        const cartData = {
            userId: currentUser.value.$id,
            productId: product.value.id,
            name: product.value.name,
            price: Number(product.value.price),
            url: getPrimaryImageUrl(),
            quantity: 1
        };

        await AppwriteService.addToCart(cartData);
        triggerToast(); // Show custom toast instead of alert
    } catch (error) {
        console.error("Cart Error:", error);
    } finally {
        isAdding.value = false;
    }
};

const handleBuyNow = () => {
    if (!currentUser.value) {
        router.push('/login');
        return;
    }

    router.push({
        path: '/checkout',
        state: {
            buyNowProduct: {
                productId: product.value.id,
                name: product.value.name,
                price: product.value.price,
                url: getPrimaryImageUrl(),
                qty: 1
            }
        }
    });
};

const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            await AppwriteService.deleteProduct(product.value.id);
            router.push('/products');
        } catch (error) {
            alert("Delete failed.");
        }
    }
};
</script>

<template>
    <!-- TOAST NOTIFICATION -->
    <Transition name="fade">
        <div v-if="showToast"
            class="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 rounded-sm shadow-2xl flex items-center gap-4 border border-gray-800">
            <span class="text-green-400">✓</span>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em]">Added to your cart</p>
        </div>
    </Transition>

    <!-- Loading State -->
    <section v-if="loading" class="mx-auto w-[90%] md:w-[85%] mt-12 animate-pulse">
        <div class="flex flex-col md:flex-row gap-10 lg:gap-24">
            <div class="w-full md:w-[40%] aspect-square bg-gray-200 rounded-[10px]"></div>
            <div class="grow space-y-4">
                <div class="h-10 bg-gray-200 w-3/4"></div>
                <div class="h-32 bg-gray-200 w-full"></div>
            </div>
        </div>
    </section>

    <!-- Product View -->
    <section v-else-if="product" class="mx-auto w-[90%] md:w-[85%] mt-12 mb-20 text-left">
        <div class="flex flex-col md:flex-row gap-10 lg:gap-24 items-start justify-center">

            <!-- Image Gallery -->
            <div class="w-full md:w-[40%] max-w-[450px] shrink-0">
                <div class="overflow-hidden rounded-[10px] bg-gray-50 aspect-square mb-4 border">
                    <img :src="product.parsedUrls[activeImageIndex]" :alt="product.name"
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
                    <h2 class="text-xl md:text-3xl font-bold text-[#3A3A3A] uppercase tracking-wider">
                        {{ product.name }}
                    </h2>
                    <p class="text-lg md:text-xl font-medium text-gray-600">₦{{ product.price }}</p>
                </div>

                <div class="text-sm md:text-base text-gray-500 leading-relaxed max-w-md">
                    <p>{{ product.description || 'No description available.' }}</p>
                </div>

                <div class="flex flex-col gap-3 mt-4 w-full md:max-w-[320px]">
                    <template v-if="isAdmin">
                        <RouterLink :to="`/products/edit/${product.id}`"
                            class="bg-black text-white py-4 text-[11px] font-bold tracking-[0.2em] hover:bg-gray-800 transition text-center uppercase">
                            Edit Product
                        </RouterLink>
                        <button @click="handleDelete"
                            class="border border-red-500 text-red-500 p-4 text-[11px] font-bold tracking-[0.2em] hover:bg-red-500 hover:text-white transition uppercase">
                            Delete Product
                        </button>
                    </template>

                    <template v-else>
                        <button @click="handleAddToCart" :disabled="isAdding"
                            class="bg-black text-white py-4 text-[11px] font-bold tracking-[0.2em] hover:bg-gray-800 transition uppercase disabled:opacity-50">
                            {{ isAdding ? 'Adding...' : 'Add to Cart' }}
                        </button>
                        <button @click="handleBuyNow"
                            class="border border-black py-4 text-[11px] font-bold tracking-[0.2em] hover:bg-black hover:text-white transition uppercase">
                            Buy Now
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </section>

    <!-- Error State -->
    <section v-else class="text-center py-40">
        <p class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Product not found.</p>
        <RouterLink to="/products" class="text-[10px] font-bold uppercase tracking-widest underline mt-4 block">
            Back to products
        </RouterLink>
    </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -20px);
}
</style>
