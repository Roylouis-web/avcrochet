<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';
import { Query } from 'appwrite';

const router = useRouter();
const cartItems = ref([]);
const loading = ref(true);
const user = ref(null);

const form = ref({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
});

onMounted(async () => {
    try {
        const currentUser = await AppwriteService.getFullUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        user.value = currentUser;

        form.value = {
            email: user.value.email,
            firstName: user.value.firstName || '',
            lastName: user.value.lastName || '',
            address: user.value.address || '',
        };

        // 1. Check if we arrived via "Buy Now"
        const stateProduct = window.history.state?.buyNowProduct;

        if (stateProduct) {
            // Use only the Buy Now item
            cartItems.value = [stateProduct];
        } else {
            // 2. Fallback: Fetch the regular cart from Appwrite
            const cartResponse = await AppwriteService.getCarts([
                Query.equal('userId', currentUser.$id)
            ]);
            cartItems.value = cartResponse.rows.map(doc => ({
                ...doc,
                qty: doc.quantity
            }));
        }
    } catch (error) {
        console.error("Checkout initialization failed:", error);
    } finally {
        loading.value = false;
    }
});

const subtotal = computed(() =>
    cartItems.value.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0)
);

const shipping = 500;
const total = computed(() => subtotal.value + shipping);

const payWithPaystack = () => {
    if (!form.value.email || !form.value.firstName || !form.value.address) {
        alert("Please complete your shipping details.");
        return;
    }

    const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, // Replace with your key
        email: form.value.email,
        amount: total.value * 100,
        currency: 'NGN',
        // FIX: Use a standard function here, NOT an async one
        callback: function (response) {
            // Move async logic into a promise chain
            AppwriteService.createOrder({
                status: 'processing',
                items: JSON.stringify(cartItems.value),
                total: total.value,
                userId: user.value.$id,
                firstName: form.value.firstName,
                lastName: form.value.lastName,
                telephone: user.value.telephone || '',
                address: form.value.address,
                date: new Date().toISOString()
            })
                .then(() => {
                    // Delete cart items only if they came from the database ($id exists)
                    const deletePromises = cartItems.value
                        .filter(item => item.$id)
                        .map(item => AppwriteService.deleteCartItem(item.$id));

                    return Promise.all(deletePromises);
                })
                .then(() => {
                    router.push('/orders');
                })
                .catch((err) => {
                    console.error("Order completion failed:", err);
                    alert("Payment successful, but we couldn't save your order. Contact support.");
                });
        },
        onClose: () => alert("Transaction cancelled.")
    });

    handler.openIframe();
};

</script>

<template>
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>

    <div v-else class="mx-auto w-[95%] lg:w-[85%] mt-12 mb-20 grid grid-cols-1 lg:grid-cols-12 gap-16 text-left">
        <!-- Shipping Details -->
        <section class="lg:col-span-7 flex flex-col gap-10">
            <header>
                <h1
                    class="text-2xl font-bold uppercase tracking-widest text-[#3A3A3A] border-b border-[whitesmoke] pb-4">
                    Checkout
                </h1>
            </header>

            <div class="flex flex-col gap-6 text-sm">
                <h2 class="font-black uppercase tracking-widest text-black">1. Contact Information</h2>
                <input v-model="form.email" type="email"
                    class="border-gray-200 border-2 h-14 pl-4 bg-gray-50 text-gray-400 cursor-not-allowed" disabled>
            </div>

            <div class="flex flex-col gap-6 text-sm">
                <h2 class="font-black uppercase tracking-widest text-black">2. Shipping Address</h2>
                <div class="grid grid-cols-2 gap-4">
                    <input v-model="form.firstName" type="text" placeholder="First Name"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none">
                    <input v-model="form.lastName" type="text" placeholder="Last Name"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none">
                </div>
                <textarea v-model="form.address" placeholder="Full Delivery Address"
                    class="border-gray-200 border-2 h-32 p-4 focus:border-black outline-none resize-none"></textarea>
            </div>
        </section>

        <!-- Summary -->
        <section class="lg:col-span-5 bg-white border border-[whitesmoke] p-8 h-fit sticky top-24 shadow-sm">
            <h2 class="text-sm font-black uppercase tracking-widest mb-8 text-black">Order Summary</h2>

            <div class="flex flex-col gap-6 mb-8 max-h-80 overflow-y-auto pr-2">
                <div v-for="item in cartItems" :key="item.productId || item.$id" class="flex items-center gap-4">
                    <div class="size-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        <img :src="item.url" class="size-full object-cover">
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-sm text-[#3A3A3A] truncate">{{ item.name }}</p>
                        <p class="text-[10px] text-gray-400 uppercase font-bold">Qty: {{ item.qty }}</p>
                    </div>
                    <p class="font-bold text-[#3A3A3A]">₦{{ Number(item.price).toLocaleString() }}</p>
                </div>
            </div>

            <div class="border-t border-gray-100 pt-6 flex flex-col gap-4 text-sm font-medium">
                <div class="flex justify-between">
                    <span class="text-gray-400 uppercase text-[11px] font-bold">Subtotal</span>
                    <span class="text-[#3A3A3A]">₦{{ subtotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400 uppercase text-[11px] font-bold">Shipping</span>
                    <span class="text-[#3A3A3A]">₦{{ shipping.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-xl font-black border-t border-gray-100 pt-4 mt-2">
                    <span class="text-black uppercase text-sm tracking-tighter">Total</span>
                    <span class="text-black">₦{{ total.toLocaleString() }}</span>
                </div>
            </div>

            <button @click="payWithPaystack" :disabled="cartItems.length === 0"
                class="bg-black text-white w-full py-5 mt-10 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-gray-800 transition-all disabled:bg-gray-400">
                Pay Now
            </button>
        </section>
    </div>
</template>
