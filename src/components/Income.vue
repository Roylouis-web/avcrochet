<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router'; // Added for the empty state link
import AppwriteService from '@/services/AppwriteService';

const orders = ref([]);
const loading = ref(true);

const fetchIncomeData = async () => {
    loading.value = true;
    try {
        const response = await AppwriteService.getOrders();
        orders.value = response.rows || response.documents || [];
    } catch (error) {
        console.error("Failed to fetch income:", error);
    } finally {
        loading.value = false;
    }
};

// --- CSV EXPORT LOGIC ---
const exportToCSV = () => {
    if (orders.value.length === 0) return;

    const headers = ["Order ID", "Date", "Customer Name", "Telephone", "Address", "Status", "Total (₦)"];
    const rows = orders.value.map(order => [
        order.$id,
        new Date(order.date || order.$createdAt).toLocaleDateString(),
        `${order.firstName} ${order.lastName}`,
        `'${order.telephone}`,
        `"${order.address.replace(/"/g, '""')}"`,
        order.status.toUpperCase(),
        order.total
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Income_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const totalRevenue = computed(() => orders.value.reduce((sum, order) => sum + Number(order.total || 0), 0));

const completedRevenue = computed(() => {
    return orders.value
        .filter(o => o.status?.toLowerCase() === 'completed')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
});

const totalUnitsSold = computed(() => {
    return orders.value.reduce((sum, order) => {
        try {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
            return sum + items.reduce((iSum, item) => iSum + (Number(item.quantity) || 1), 0);
        } catch (e) { return sum + 1; }
    }, 0);
});

onMounted(fetchIncomeData);
</script>

<template>
    <section class="mx-auto w-[90%] md:w-[85%] mt-16 mb-24 text-left">
        <header
            class="mb-12 border-b border-[whitesmoke] pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 class="text-3xl font-black uppercase tracking-[0.2em] text-[#3A3A3A]">Revenue & Analytics</h1>
                <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">Financial overview based
                    on customer orders</p>
            </div>

            <button @click="exportToCSV" :disabled="loading || orders.length === 0"
                class="bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 shrink-0">
                Export CSV ↓
            </button>
        </header>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            <div v-for="i in 3" :key="i" class="h-32 bg-gray-50 rounded-xl border border-[whitesmoke]"></div>
        </div>

        <!-- EMPTY STATE: DISPLAYED IF NO ORDERS FOUND -->
        <div v-else-if="orders.length === 0"
            class="text-center py-32 border-2 border-dashed border-[whitesmoke] rounded-2xl">
            <h2 class="text-xl font-black uppercase tracking-[0.2em] text-gray-300">No Sales Recorded Yet</h2>
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 mb-8">Income data will appear
                here once customers start placing orders.</p>
            <RouterLink to="/products"
                class="bg-black text-white px-10 py-4 text-[10px] font-black tracking-[0.2em] uppercase">View Products
            </RouterLink>
        </div>

        <div v-else class="space-y-12">
            <!-- STATS CARDS -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div
                    class="p-8 border-2 border-[whitesmoke] rounded-xl bg-white shadow-sm hover:border-black transition-colors">
                    <span class="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em]">Gross Revenue</span>
                    <p class="text-3xl font-black mt-3 text-black">₦{{ totalRevenue.toLocaleString() }}</p>
                </div>

                <div class="p-8 border-2 border-[whitesmoke] rounded-xl bg-white shadow-sm">
                    <span class="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em]">Settled
                        (Completed)</span>
                    <p class="text-3xl font-black mt-3 text-green-600">₦{{ completedRevenue.toLocaleString() }}</p>
                </div>

                <div class="p-8 border-2 border-[whitesmoke] rounded-xl bg-white shadow-sm">
                    <span class="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em]">Total Units Sold</span>
                    <p class="text-3xl font-black mt-3 text-black">{{ totalUnitsSold }} <span
                            class="text-xs font-bold text-gray-300">items</span></p>
                </div>
            </div>

            <!-- INCOME LOG TABLE -->
            <div class="border-2 border-[whitesmoke] rounded-xl overflow-hidden bg-white shadow-sm">
                <div class="bg-[whitesmoke] px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-[10px] font-bold uppercase tracking-[0.2em]">Recent Income Log</h2>
                    <span class="text-[9px] font-black uppercase bg-black text-white px-3 py-1 rounded-full">{{
                        orders.length }} Total Orders</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="text-[10px] uppercase font-black text-gray-400 border-b border-gray-50">
                                <th class="px-8 py-5">Date</th>
                                <th class="px-8 py-5">Customer</th>
                                <th class="px-8 py-5 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="text-xs">
                            <tr v-for="order in orders" :key="order.$id"
                                class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td class="px-8 py-5 text-gray-500 font-medium">
                                    {{ new Date(order.date || order.$createdAt).toLocaleDateString() }}
                                </td>
                                <td class="px-8 py-5">
                                    <div class="flex flex-col">
                                        <span class="font-bold text-black uppercase">{{ order.firstName }} {{
                                            order.lastName }}</span>
                                        <span class="text-[9px] text-gray-400">{{ order.telephone }}</span>
                                    </div>
                                </td>
                                <td class="px-8 py-5 text-right font-black text-sm text-[#3A3A3A]">
                                    ₦{{ Number(order.total).toLocaleString() }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>
