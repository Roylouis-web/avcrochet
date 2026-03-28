<script setup>
import { ref, onMounted } from 'vue'
import AppwriteService from '@/services/AppwriteService'

const displayedOrders = ref([])
const loading = ref(true)

// --- UPDATED RECEIPT GENERATION LOGIC WITH SIZE ---
const downloadReceipt = (order) => {
    const date = new Date(order.date || order.$createdAt).toLocaleDateString();

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
        // Added Size to the item line in receipt
        const sizeInfo = item.size ? ` [Size: ${item.size}]` : '';
        receiptContent += `${item.name}${sizeInfo} (x${item.quantity || 1}) - ₦${(item.price * (item.quantity || 1)).toLocaleString()}\n`;
    });

    receiptContent += `
----------------------------------------
TOTAL PAID: ₦${Number(order.total).toLocaleString()}
========================================
   Thank you for shopping with us!
========================================
`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${order.$id.slice(-6)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

const loadOrders = async () => {
    try {
        const response = await AppwriteService.getOrders();
        // Handle both response formats (rows/documents)
        const docs = response.rows || response.documents || [];

        displayedOrders.value = docs.map(doc => {
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
    } catch (e) {
        console.error("Order load error:", e);
    } finally {
        loading.value = false;
    }
}
onMounted(loadOrders);
</script>

<template>
    <section class="mx-auto w-[90%] mt-16 mb-24">
        <div v-if="!loading && displayedOrders.length === 0" class="text-center py-40 rounded-xl">
            <h2 class="text-2xl font-black uppercase tracking-[0.3em] mb-12">No Orders Found</h2>
            <RouterLink to="/products"
                class="bg-black text-white px-10 py-4 text-[10px] font-black tracking-[0.2em] uppercase">Start Shopping
            </RouterLink>
        </div>

        <div v-for="order in displayedOrders" :key="order.$id"
            class="border-2 border-[whitesmoke] rounded-xl mb-12 overflow-hidden shadow-sm">
            <div class="bg-[whitesmoke] px-8 py-6 flex justify-between items-center">
                <div class="flex gap-12">
                    <div>
                        <span class="text-[11px] font-bold uppercase text-gray-400">Order Total</span>
                        <p class="font-bold">₦{{ Number(order.total).toLocaleString() }}</p>
                    </div>
                    <div>
                        <span class="text-[11px] font-bold uppercase text-gray-400">Order ID</span>
                        <p class="font-mono text-[10px] text-gray-600 mt-1">#{{ order.$id.slice(-8).toUpperCase() }}</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button v-if="order.status === 'completed'" @click="downloadReceipt(order)"
                        class="text-[10px] font-bold border border-black px-4 py-2 uppercase hover:bg-black hover:text-white transition-all">
                        Receipt ↓
                    </button>
                    <div class="px-4 py-2 text-[10px] font-bold uppercase text-white bg-black">
                        {{ order.status }}
                    </div>
                </div>
            </div>
            <div class="p-8 flex flex-col gap-6">
                <div v-for="item in order.items" :key="item.id" class="flex gap-6 items-center">
                    <img :src="item.displayUrl" class="w-16 h-16 object-cover rounded border bg-gray-50">
                    <div class="flex flex-col gap-1">
                        <p class="font-bold uppercase text-sm text-[#3A3A3A]">{{ item.name }} (x{{ item.quantity }})</p>
                        <!-- DISPLAY SIZE FIELD HERE -->
                        <p v-if="item.size" class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Size: <span class="text-black">{{ item.size }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>