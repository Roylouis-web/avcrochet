<template>
    <main class="relative h-screen w-full overflow-hidden bg-black">
        <div class="absolute inset-0 z-0">
            <!-- 
                FIX: Lowered brightness slightly more (75) to allow 
                the gold text to remain the brightest element on screen.
            -->
            <img src="/src/public/hero.webp" alt="AV Crochet Editorial"
                class="h-full w-full object-cover object-center antialiased transition-opacity duration-1000 brightness-75 contrast-[1.05] scale-[1.02]" />

            <!-- 
                FIX: Added a multi-layer gradient. 
                Top-down for facial clarity, bottom-up for button contrast. 
            -->
            <div class="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80"></div>
            <div class="absolute inset-0 bg-black/10"></div>
        </div>

        <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
            <!-- 
                FIX: Added a defined shadow. 
                Gold text on busy patterns needs this "edge" to be readable.
            -->
            <p class="animate-fade-in text-[#D4AF37] text-3xl md:text-5xl lg:text-6xl italic font-serif mb-8 tracking-wide 
                      drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                From my hands to your heart
            </p>

            <RouterLink to="/collections"
                class="animate-fade-in-delayed group relative bg-[#D4AF37] hover:bg-[#FFD700] hover:scale-105 px-16 py-5 text-sm font-black uppercase tracking-[0.4em] text-white transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                Shop Now
            </RouterLink>
        </div>
    </main>
</template>

<style scoped>
/* High-quality rendering remains essential for the intricate crochet details */
img {
    image-rendering: -webkit-optimize-contrast;
    backface-visibility: hidden;
    transform: translateZ(0);
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
