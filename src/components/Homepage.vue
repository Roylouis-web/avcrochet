<template>
    <main class="relative h-screen w-full overflow-hidden bg-black">
        <div class="absolute inset-0 z-0">
            <!-- 
              CRISP FIX: 
              - Use 'antialiased' to smooth edges.
              - Added 'brightness-110' and 'contrast-105' to make the image "pop" like professional photography.
            -->
            <img src="/src/public/hero2.webp" alt="AV Crochet Editorial"
                class="h-full w-full object-cover object-center antialiased transition-opacity duration-1000 brightness-105 contrast-[1.02] scale-[1.01]" />

            <!-- GRADIENT OVERLAY: Creates depth and makes text more readable than a flat overlay -->
            <div class="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/60"></div>
        </div>

        <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
            <!-- Added a subtle text-shadow (drop-shadow-lg) to make the motto look sharp -->
            <p
                class="animate-fade-in  text-[#D4AF37] text-3xl md:text-5xl lg:text-6xl italic font-serif mb-8 tracking-wide drop-shadow-2xl">
                From my hands to your heart
            </p>

            <RouterLink to="/collections"
                class="animate-fade-in-delayed group relative bg-[#D4AF37] hover:bg-[#FFD700] backdrop-blur-md px-16 py-5 text-sm font-black uppercase tracking-[0.4em] text-white transition-all duration-500">
                Shop Now
            </RouterLink>
        </div>
    </main>
</template>

<style scoped>
/* 
   IMAGE RENDERING HACK: 
   Forces the browser to use a high-quality scaling algorithm. 
*/
img {
    image-rendering: -webkit-optimize-contrast;
    backface-visibility: hidden;
    transform: translateZ(0);
    /* Triggers GPU acceleration for smoother rendering */
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
        transform: translateY(20px);
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
