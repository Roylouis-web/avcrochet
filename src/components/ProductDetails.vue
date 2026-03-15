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

const isAdmin = computed(() => {
    return currentUser.value?.role === 'admin';
});

const fetchData = async () => {
    loading.value = true;
    try {
        currentUser.value = await AppwriteService.getFullUser();
        const productId = route.params.id;
        const response = await AppwriteService.getProduct(productId);

        if (response) {
            product.value = response;
        } else {
            product.value = null;
        }
    } catch (error) {
        console.error("Data fetch failed:", error);
        product.value = null;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

const handleAddToCart = async () => {
    if (!product.value?.id) return;

    isAdding.value = true;
    try {
        if (!currentUser.value) {
            router.push('/login');
            return;
        }

        // FIX: Payload now matches all your cart fields exactly
        const cartData = {
            userId: currentUser.value.$id,
            productId: product.value.id,
            name: product.value.name,
            price: Number(product.value.price), // Force Double type
            url: product.value.url,
            quantity: 1 // Explicitly include quantity
        };

        // Pass only the cartData object to match the Service method
        await AppwriteService.addToCart(cartData);


    } catch (error) {
        console.error("Cart Error Response:", error.response); // Check this for specific field errors
        alert("Failed to add to cart. Check console for field mismatches.");
    } finally {
        isAdding.value = false;
    }
};

const handleBuyNow = () => {
    if (!currentUser.value) {
        router.push('/login');
        return;
    }

    // Send the product data through the router state
    router.push({
        path: '/checkout',
        state: {
            buyNowProduct: {
                productId: product.value.id,
                name: product.value.name,
                price: product.value.price,
                url: product.value.url,
                qty: 1 // Default to 1 for Buy Now
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
            alert("Delete failed. You may not have permissions.");
        }
    }
};
</script>

<template>
    <!-- Loading State -->
    <section v-if="loading" class="mx-auto w-[90%] md:w-[85%] mt-12 animate-pulse text-left">
        <div class="flex flex-col md:flex-row gap-10 lg:gap-24">
            <div class="w-full md:w-[40%] aspect-square bg-gray-200 rounded-[10px]"></div>
            <div class="grow space-y-4">
                <div class="h-10 bg-gray-200 w-3/4"></div>
                <div class="h-6 bg-gray-200 w-1/4"></div>
                <div class="h-32 bg-gray-200 w-full"></div>
            </div>
        </div>
    </section>

    <!-- Product View -->
    <section v-else-if="product" class="mx-auto w-[90%] md:w-[85%] mt-12 mb-20 text-left">
        <div class="flex flex-col md:flex-row gap-10 lg:gap-24 items-start justify-center">
            <div
                class="w-full md:w-[40%] max-w-[450px] overflow-hidden rounded-[10px] bg-gray-50 aspect-square shrink-0">
                <img :src="product.url" :alt="product.name"
                    class="w-full h-full object-cover transition-transform duration-700 hover:scale-105">
            </div>

            <div class="flex flex-col gap-6 md:w-1/2 pt-1">
                <div class="space-y-2">
                    <h2 class="text-xl md:text-3xl font-bold text-[#3A3A3A] uppercase tracking-wider">
                        {{ product.name }}
                    </h2>
                    <p class="text-lg md:text-xl font-medium text-gray-600">₦{{ product.price }}</p>
                </div>

                <div class="text-sm md:text-base text-gray-500 leading-relaxed max-w-md">
                    <p>{{ product.description || 'No description available for this product.' }}</p>
                </div>

                <div class="flex flex-col gap-3 mt-4 w-full md:max-w-[320px]">
                    <template v-if="isAdmin">
                        <RouterLink :to="`/products/edit/${product.id}`"
                            class="bg-black text-white py-3 text-[11px] font-bold tracking-[0.2em] hover:bg-gray-800 transition duration-300 uppercase text-center">
                            Edit Product
                        </RouterLink>
                        <button @click="handleDelete"
                            class="border border-red-500 text-red-500 p-3 text-[11px] font-bold tracking-[0.2em] hover:bg-red-500 hover:text-white transition duration-300 uppercase">
                            Delete Product
                        </button>
                    </template>

                    <template v-else>
                        <button @click="handleAddToCart" :disabled="isAdding"
                            class="bg-black text-white py-3 text-[11px] font-bold tracking-[0.2em] hover:bg-gray-800 transition duration-300 uppercase disabled:opacity-50">
                            {{ isAdding ? 'Adding...' : 'Add to Cart' }}
                        </button>
                        <button @click="handleBuyNow"
                            class="border border-black py-3 text-[11px] font-bold tracking-[0.2em] hover:bg-black hover:text-white transition duration-300 uppercase">
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
