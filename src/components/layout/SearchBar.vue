<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
const searchQuery = ref('')
const router = useRouter();
const emit = defineEmits(['close']);
const props = defineProps({
    isVisible: Boolean,
    searchInput: String
})

const handleSearch = () => {
    if (!searchQuery.value.trim()) return;
    router.push({ path: '/products', query: { q: searchQuery.value.trim() } });
    emit('close')
    searchQuery.value = '';
}
</script>
<template>
    <!-- Search Bar Overlay -->
    <Transition enter-active-class="transition duration-500 ease-out"
        enter-from-class="transform -translate-y-full opacity-0" enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-300 ease-in" leave-to-class="opacity-0 translate-y-[-20px]">

        <!-- 
          FIX 1: Changed to bg-black/90 with heavier blur. 
          This creates a solid "shelf" that sits over the photo.
        -->
        <div v-show="isVisible"
            class="flex items-center gap-6 w-full absolute top-0 z-50 bg-black/90 backdrop-blur-xl h-40 px-6 lg:px-60 border-b border-[#D4AF37]/30 shadow-2xl">

            <div class="relative grow max-w-4xl mx-auto">
                <!-- 
                  FIX 2: High-contrast Input.
                  - Text is now white and larger (text-lg).
                  - Border turns Gold on focus.
                  - Placeholder is light gray for readability.
                -->
                <input ref="searchInput" v-model="searchQuery" type="text" placeholder="Search our collection..."
                    @keyup.enter="handleSearch"
                    class="block w-full py-5 px-8 pr-16 text-lg font-light tracking-wide border border-white/10 rounded-none bg-white/5 text-white placeholder-gray-400 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all duration-300" />

                <!-- FIX 3: Gold Search Icon -->
                <button @click="handleSearch" class="absolute inset-y-0 right-0 flex items-center pr-6 group">
                    <svg class="w-6 h-6 text-[#D4AF37] group-hover:scale-110 transition-transform" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>

            <!-- FIX 4: Clearer Close Button -->
            <button @click="emit('close')"
                class="p-3 text-white/70 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-all">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </Transition>
</template>
