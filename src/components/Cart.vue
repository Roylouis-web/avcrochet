<script setup>
import { ref, computed, onMounted } from 'vue'
import AppwriteService from '@/services/AppwriteService'
import { Query } from 'appwrite'

const loading = ref(true)
const cartItems = ref([])
const user = ref(null)

onMounted(async () => {
    try {
        user.value = await AppwriteService.getFullUser()
        if (user.value) {
            const response = await AppwriteService.getCarts([
                Query.equal('userId', user.value.$id)
            ])

            // FIX: Use .rows instead of .documents
            const rowData = response.rows || []

            cartItems.value = rowData.map(doc => ({
                ...doc,
                id: doc.$id,
                // Safety check for parsing JSON
                outfits: typeof doc.outfits === 'string' ? JSON.parse(doc.outfits) : (doc.outfits || [])
            }))
        }
    } catch (error) {
        console.error("Cart fetch error:", error)
    } finally {
        loading.value = false
    }
})

const subtotal = computed(() => {
    return cartItems.value.reduce((acc, item) => acc + (item.price * item.quantity), 0)
})

const updateQuantity = async (docId, delta) => {
    const item = cartItems.value.find(i => i.id === docId)
    if (item) {
        const newQty = item.quantity + delta
        if (newQty < 1) return

        try {
            item.quantity = newQty
            await AppwriteService.updateCart(docId, newQty)
        } catch (error) {
            item.quantity -= delta
            console.error("Update failed:", error)
        }
    }
}

const removeItem = async (docId) => {
    try {
        await AppwriteService.deleteCartItem(docId)
        cartItems.value = cartItems.value.filter(item => item.id !== docId)
    } catch (error) {
        console.error("Remove failed:", error)
    }
}
</script>

<!-- Template remains largely the same, ensuring you use 'item.id' for keys -->


<template>
    <section class="mx-auto w-[95%] md:w-[85%] lg:w-[70%] mt-12 mb-20">
        <header class="border-b-2 border-[whitesmoke] py-8 text-center">
            <h1 class="text-3xl font-bold tracking-tight uppercase text-[#3A3A3A]">Your Cart</h1>
            <div class="mt-4">
                <RouterLink to="/products"
                    class="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-black hover:underline underline-offset-8 transition-all duration-300 underline">
                    Continue Shopping
                </RouterLink>
            </div>
        </header>

        <!-- LOADING STATE -->
        <div v-if="loading" class="mt-10 flex flex-col gap-8">
            <div v-for="n in 3" :key="n" class="flex flex-col sm:flex-row items-center gap-6 pb-8 animate-pulse">
                <div class="w-32 h-32 shrink-0 rounded-[10px] bg-gray-200"></div>
                <div class="grow flex flex-col gap-3 w-full">
                    <div class="h-6 bg-gray-200 rounded w-1/2 mx-auto sm:mx-0"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/4 mx-auto sm:mx-0"></div>
                    <div class="h-8 bg-gray-200 rounded w-32 mt-2 mx-auto sm:mx-0"></div>
                </div>
            </div>
        </div>

        <!-- ACTUAL CART CONTENT -->
        <div v-else-if="cartItems.length > 0" class="mt-10 flex flex-col gap-12">
            <div class="flex flex-col gap-8">
                <div v-for="item in cartItems" :key="item.id"
                    class="flex flex-col sm:flex-row items-center gap-6 border-b border-[whitesmoke] pb-8">

                    <div class="w-32 h-32 shrink-0 overflow-hidden rounded-[10px] bg-gray-50">
                        <img :src="item.url || item.imageUrl" :alt="item.name" class="w-full h-full object-cover">
                    </div>

                    <div class="grow text-center sm:text-left">
                        <h2 class="text-lg font-bold uppercase tracking-wider text-[#3A3A3A]">{{ item.name }}</h2>
                        <p class="text-gray-500 mt-1">${{ item.price }}</p>

                        <div class="flex items-center justify-center sm:justify-start mt-4 gap-4">
                            <div class="flex items-center border border-gray-200 rounded">
                                <button @click="updateQuantity(item.id, -1)"
                                    class="px-3 py-1 hover:bg-gray-100">-</button>
                                <span class="px-4 font-bold text-sm">{{ item.quantity }}</span>
                                <button @click="updateQuantity(item.id, 1)"
                                    class="px-3 py-1 hover:bg-gray-100">+</button>
                            </div>
                            <button @click="removeItem(item.id)"
                                class="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 underline underline-offset-4">
                                Remove
                            </button>
                        </div>
                    </div>

                    <div class="hidden sm:block text-right">
                        <p class="font-bold text-lg">${{ item.price * item.quantity }}</p>
                    </div>
                </div>
            </div>

            <section class="flex flex-col items-center md:items-end gap-6 border-t-2 border-[whitesmoke] pt-10">
                <div class="flex justify-between w-full sm:w-72">
                    <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Subtotal</span>
                    <span class="text-xl font-bold">${{ subtotal }}</span>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 mx-auto md:mx-0 w-[75%] sm:w-max">
                    <RouterLink to="/checkout">
                        <button
                            class="bg-black text-white px-16 py-4 text-[11px] font-bold tracking-[0.2em] hover:bg-gray-800 transition-all uppercase">
                            CHECKOUT
                        </button>
                    </RouterLink>
                </div>
            </section>
        </div>

        <section v-else-if="!loading" class="text-center py-24">
            <p class="text-gray-500 text-lg mb-8 uppercase tracking-widest font-medium">Your cart is empty</p>
            <RouterLink to="/products"
                class="inline-block bg-black text-white px-10 py-4 text-[11px] font-bold tracking-[0.2em] hover:bg-gray-800 transition-all uppercase">
                CONTINUE SHOPPING
            </RouterLink>
        </section>
    </section>
</template>
