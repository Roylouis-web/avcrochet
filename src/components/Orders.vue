<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import AppwriteService from '@/services/AppwriteService'
import { Query } from 'appwrite'

const displayedOrders = ref([])
const loading = ref(true)
const loadMoreTrigger = ref(null)
const totalOrders = ref(0)
const user = ref(null)

let observer = null
const pageSize = 5

// Status update logic for admins
const updateStatus = async (orderId, newStatus) => {
    try {
        const order = displayedOrders.value.find(o => o.$id === orderId);
        if (order) order.status = newStatus;

        await AppwriteService.updateOrder(orderId, { status: newStatus });
    } catch (error) {
        console.error("Failed to update status:", error);
        alert("Could not update status. Please check your permissions.");
    }
}

const loadMore = async () => {
    if (!user.value?.$id) return;
    if (loading.value && displayedOrders.value.length > 0) return;
    if (totalOrders.value > 0 && displayedOrders.value.length >= totalOrders.value) return;

    loading.value = true;
    try {
        // BUILD QUERIES: If admin, show everything. If user, filter by their ID.
        const queries = [
            Query.limit(pageSize),
            Query.offset(displayedOrders.value.length),
            Query.orderDesc('$createdAt')
        ];

        if (user.value.role !== 'admin') {
            queries.push(Query.equal('userId', user.value.$id));
        }

        const response = await AppwriteService.getOrders(queries);

        const rowData = response.rows || [];
        const newOrders = rowData.map(doc => ({
            ...doc,
            items: typeof doc.items === 'string' ? JSON.parse(doc.items) : (doc.items || [])
        }));

        if (newOrders.length > 0) {
            displayedOrders.value.push(...newOrders);
            totalOrders.value = response.total;
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    user.value = await AppwriteService.getFullUser();

    if (user.value) {
        await loadMore();
        await nextTick();

        observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !loading.value) {
                loadMore();
            }
        }, { rootMargin: '200px' });

        if (loadMoreTrigger.value) {
            observer.observe(loadMoreTrigger.value);
        }
    } else {
        loading.value = false;
    }
});

onUnmounted(() => {
    if (observer) observer.disconnect();
});

const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'bg-green-600';
    if (s === 'cancelled') return 'bg-red-500';
    if (s === 'processing') return 'bg-blue-600';
    return 'bg-black';
}
</script>

<template>
    <section class="mx-auto w-[95%] md:w-[90%] lg:w-[80%] mt-16 mb-24">
        <!-- Loading State -->
        <div v-if="loading && displayedOrders.length === 0" class="flex justify-center py-20">
            <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="user && displayedOrders.length === 0" class="text-center py-20 flex flex-col items-center">
            <h2 class="text-xl font-bold uppercase tracking-widest text-[#3A3A3A]">No orders yet</h2>
            <p class="text-gray-400 mt-2">Start your journey today.</p>
            <RouterLink to="/products"
                class="mt-8 px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full">
                Start Browsing
            </RouterLink>
        </div>

        <!-- Orders List -->
        <template v-else-if="displayedOrders.length > 0">
            <header class="border-b-2 border-[whitesmoke] py-10 text-center">
                <h1 class="text-4xl font-bold tracking-tight uppercase text-[#3A3A3A]">
                    {{ user?.role === 'admin' ? 'Manage Orders' : 'Your Orders' }}
                </h1>
            </header>

            <div class="mt-12 flex flex-col gap-12">
                <div v-for="order in displayedOrders" :key="order.$id"
                    class="border-2 border-[whitesmoke] rounded-xl overflow-hidden shadow-sm">

                    <!-- Order Header -->
                    <div class="bg-[whitesmoke] px-8 py-6 flex flex-wrap justify-between items-center gap-6">
                        <div class="flex flex-wrap gap-8 lg:gap-12 text-left items-center">
                            <!-- Date -->
                            <div class="flex flex-col gap-1">
                                <span class="text-[11px] font-bold uppercase tracking-widest text-gray-400">Date</span>
                                <span class="text-base font-semibold text-[#3A3A3A]">
                                    {{ new Date(order.date || order.$createdAt).toLocaleDateString() }}
                                </span>
                            </div>

                            <!-- Total -->
                            <div class="flex flex-col gap-1">
                                <span class="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total</span>
                                <span class="text-base font-bold text-[#3A3A3A]">₦{{
                                    Number(order.total).toLocaleString() }}</span>
                            </div>

                            <!-- ADMIN ONLY: Customer Info -->
                            <div v-if="user?.role === 'admin'" class="flex gap-8 border-l-2 border-gray-200 pl-8">
                                <div class="flex flex-col gap-1">
                                    <span
                                        class="text-[11px] font-bold uppercase tracking-widest text-gray-400">Customer</span>
                                    <span class="text-sm font-bold text-black uppercase">
                                        {{ order.firstName }} {{ order.lastName }}
                                    </span>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <span
                                        class="text-[11px] font-bold uppercase tracking-widest text-gray-400">Phone</span>
                                    <a :href="`tel:${order.telephone}`"
                                        class="text-sm font-bold text-blue-600 hover:underline">
                                        {{ order.telephone }}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Status Control -->
                        <div>
                            <select v-if="user?.role === 'admin'" @change="updateStatus(order.$id, $event.target.value)"
                                :class="['text-white text-[11px] font-bold px-4 py-2 tracking-[0.2em] uppercase rounded-sm border-none cursor-pointer outline-none transition-colors duration-300', getStatusClass(order.status)]">
                                <option value="processing" :selected="order.status === 'processing'">Processing</option>
                                <option value="completed" :selected="order.status === 'completed'">Completed</option>
                                <option value="cancelled" :selected="order.status === 'cancelled'">Cancelled</option>
                            </select>

                            <div v-else
                                :class="['text-white text-[11px] font-bold px-4 py-2 tracking-[0.2em] uppercase rounded-sm', getStatusClass(order.status)]">
                                {{ order.status }}
                            </div>
                        </div>
                    </div>

                    <!-- Items Display -->
                    <div class="px-8 py-8 flex flex-col gap-10">
                        <div v-for="item in order.items" :key="item.id" class="flex items-center gap-8 text-left">
                            <div
                                class="w-24 h-24 shrink-0 overflow-hidden rounded-[10px] bg-gray-50 border border-gray-100">
                                <img :src="item.url || item.imageUrl" :alt="item.name"
                                    class="w-full h-full object-cover">
                            </div>
                            <div class="flex-grow">
                                <h3 class="text-lg font-bold uppercase tracking-wide text-[#3A3A3A]">{{ item.name }}
                                </h3>
                                <p class="text-sm text-gray-500 mt-1">₦{{ Number(item.price).toLocaleString() }}</p>
                            </div>
                        </div>

                        <!-- ADMIN ONLY: Full Address -->
                        <div v-if="user?.role === 'admin' && order.address"
                            class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <span
                                class="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Shipping
                                Address</span>
                            <p class="text-sm text-gray-600 font-medium">{{ order.address }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Load More Trigger -->
        <div ref="loadMoreTrigger" class="h-24 flex items-center justify-center">
            <div v-if="loading && displayedOrders.length > 0"
                class="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
    </section>
</template>
