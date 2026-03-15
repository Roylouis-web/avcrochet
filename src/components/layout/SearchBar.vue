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
    <Transition enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-full opacity-0" enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0">
        <div v-show="isVisible"
            class="flex items-center gap-4 w-full absolute top-0 z-50 bg-white/95 backdrop-blur-md h-36 px-6 lg:px-60 border-b border-[whitesmoke] shadow-sm">
            <div class="relative grow">
                <input ref="searchInput" v-model="searchQuery" type="text" placeholder="Search our collection..."
                    @keyup.enter="handleSearch"
                    class="block w-full p-3 pr-12 text-sm border border-gray-200 rounded-full bg-gray-50 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
                <button @click="handleSearch"
                    class="absolute inset-y-0 right-0 flex items-center pr-4 group transition-colors">
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
            <button @click="emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </Transition>
</template>