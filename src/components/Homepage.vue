<script setup>
import { ref, onMounted } from 'vue'
import Spinner from './layout/Spinner.vue'
// Local state to control the loader
const isLoading = ref(true)

// Function to hide spinner once image is ready
const onImageLoad = () => {
    // Small timeout ensures the browser has rendered the image before hiding the cover
    setTimeout(() => {
        isLoading.value = false
    }, 500)
}

// Safety Fallback: Hide loader if image fails or takes too long
onMounted(() => {
    setTimeout(() => {
        isLoading.value = false
    }, 3000)
})
</script>

<template>
    <div class="relative min-h-screen bg-black">
        <!-- Passing the dynamic 'isLoading' state to the Spinner prop -->
        <Spinner :loading="isLoading" />

        <main class="relative h-screen w-full overflow-hidden bg-black">
            <div class="absolute inset-0 z-0">
                <!-- @load event triggers when the image is fully ready -->
                <img src="/hero.webp" alt="AV Crochet Editorial" @load="onImageLoad"
                    class="h-full w-full object-cover object-center antialiased brightness-85 contrast-[1.05] scale-[1.01]" />
                <div class="absolute inset-0 bg-[radial-gradient(circle,_transparent_40%,_rgba(0,0,0,0.4)_100%)]"></div>
            </div>

            <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
                <p
                    class="animate-fade-in text-[#FFD700] text-4xl md:text-6xl lg:text-7xl italic font-serif mb-10 tracking-wide">
                    From my hands to your heart
                </p>

                <RouterLink to="/products"
                    class="animate-fade-in-delayed group relative bg-[#D4AF37] hover:bg-[#FFD700] px-16 py-5 text-sm font-black uppercase tracking-[0.4em] text-white transition-all duration-500 shadow-2xl hover:scale-105">
                    Shop Now
                </RouterLink>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* Ensure fonts are loaded via global CSS or @import for the font-serif class */
img {
    image-rendering: -webkit-optimize-contrast;
    backface-visibility: hidden;
}

.animate-fade-in {
    animation: fadeIn 1.2s ease-out forwards;
}

.animate-fade-in-delayed {
    opacity: 0;
    animation: fadeIn 1.2s ease-out 0.5s forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.font-serif {
    font-family: 'Playfair Display', 'Times New Roman', serif;
}
</style>
