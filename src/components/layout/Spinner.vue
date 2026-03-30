<script setup>
// Define the prop here
defineProps({
    loading: {
        type: Boolean,
        default: true
    }
})
</script>

<template>
    <Transition name="fade">
        <!-- Use the prop 'loading' to control visibility -->
        <div v-if="loading" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
            <div class="relative flex items-center justify-center">
                <div class="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[#D4AF37]"></div>
                <div
                    class="absolute h-24 w-24 animate-spin-slow rounded-full border border-transparent border-b-[#FFD700]/30">
                </div>
                <span
                    class="absolute text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] animate-pulse">AV</span>
            </div>
            <p class="mt-8 text-[10px] uppercase tracking-[0.5em] text-white/40">Crafting Luxury</p>
        </div>
    </Transition>
</template>

<style scoped>
.animate-spin-slow {
    animation: spin 3s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.fade-leave-active {
    transition: opacity 0.8s ease-in-out;
}

.fade-leave-to {
    opacity: 0;
}
</style>
