<script setup>
import { ref, onMounted } from 'vue'
import AppwriteService from '@/services/AppwriteService'

const displayedOrders = ref([])
const loading = ref(true)

// --- RESTORED FULL RECEIPT GENERATION LOGIC ---
const downloadReceipt = (order) => {
    const date = new Date(order.date || order.$createdAt).toLocaleDateString();

    // The detailed string formatting you had before
    let receiptContent = `
========================================
           PURCHASE RECEIPT
========================================
Order ID:   ${order.$id}
Date:       ${date}
Customer:   ${order.firstName} ${order.lastName}
Phone:      ${order.telephone}
Status:     ${order.status.toUpperCase()}
----------------------------------------
ITEMS PURCHASED:
`;

    order.items.forEach(item => {
        receiptContent += `${item.name} (x${item.quantity || 1}) - ₦${(item.price * (item.quantity || 1)).toLocaleString()}\n`;
    });

    receiptContent += `
----------------------------------------
TOTAL PAID: ₦${Number(order.total).toLocaleString()}
========================================
   Thank you for shopping with us!
========================================
`;

    // Create blob and trigger download
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${order.$id.slice(-6)}.txt`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

const loadOrders = async () => {
    try {
        const response = await AppwriteService.getOrders();
        displayedOrders.value = response.rows.map(doc => {
            let items = typeof doc.items === 'string' ? JSON.parse(doc.items) : (doc.items || []);
            const processedItems = items.map(item => {
                let img = item.url || '';
                if (item.urls) {
                    const parsed = typeof item.urls === 'string' ? JSON.parse(item.urls) : item.urls;
                    img = Array.isArray(parsed) ? parsed[0] : parsed;
                }
                return { ...item, displayUrl: img };
            });
            return { ...doc, items: processedItems };
        });
    } finally { loading.value = false; }
}
onMounted(loadOrders);
</script>

<template>
    <section class="mx-auto w-[90%] mt-16 mb-24">
        <div v-if="!loading && displayedOrders.length === 0"
            class="text-center py-40 rounded-xl">
            <h2 class="text-2xl font-black uppercase tracking-[0.3em] mb-12">No Orders Found</h2>
            <RouterLink to="/products"
                class="bg-black text-white px-10 py-4 text-[10px] font-black tracking-[0.2em] uppercase">Start Shopping
            </RouterLink>
        </div>

        <div v-for="order in displayedOrders" :key="order.$id"
            class="border-2 border-[whitesmoke] rounded-xl mb-12 overflow-hidden shadow-sm">
            <div class="bg-[whitesmoke] px-8 py-6 flex justify-between items-center">
                <div class="flex gap-12">
                    <div><span class="text-[11px] font-bold uppercase text-gray-400">Total</span>
                        <p class="font-bold">₦{{ order.total }}</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button v-if="order.status === 'completed'" @click="downloadReceipt(order)"
                        class="text-[10px] font-bold border border-black px-4 py-2 uppercase hover:bg-black hover:text-white transition-all">Receipt
                        ↓</button>
                    <div class="px-4 py-2 text-[10px] font-bold uppercase text-white bg-black">{{ order.status }}</div>
                </div>
            </div>
            <div class="p-8 flex flex-col gap-6">
                <div v-for="item in order.items" :key="item.id" class="flex gap-6 items-center">
                    <img :src="item.displayUrl" class="w-16 h-16 object-cover rounded border">
                    <p class="font-bold uppercase text-sm">{{ item.name }} (x{{ item.quantity }})</p>
                </div>
            </div>
        </div>
    </section>
</template>