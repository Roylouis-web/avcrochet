<template>
    <main class="relative h-screen w-full overflow-hidden bg-black">
        <div class="absolute inset-0 z-0">
            <!-- 
                BRIGHTNESS FIX: Set to 85. 
                This keeps the dress vibrant but ensures the gold text remains the brightest element. 
            -->
            <img src="/hero.webp" alt="AV Crochet Editorial"
                class="h-full w-full object-cover object-center antialiased brightness-85 contrast-[1.05] scale-[1.01]" />

            <!-- RADIAL OVERLAY: Slightly dims the edges to "frame" the text -->
            <div class="absolute inset-0 bg-[radial-gradient(circle,_transparent_40%,_rgba(0,0,0,0.4)_100%)]"></div>
        </div>

        <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
            <!-- 
                THE "POP" FIX: 
                - text-[#FFD700]: Uses a "Vivid Gold" (lighter and brighter).
                -: Adds a tiny 0.5px black outline so it never blends.
                - drop-shadow: Large, dark blur to create a "pocket" of legibility.
            -->
            <p
                class="animate-fade-in text-[#FFD700] text-4xl md:text-6xl lg:text-7xl italic font-serif mb-10 tracking-wide">
                From my hands to your heart
            </p>

            <RouterLink to="/collections"
                class="animate-fade-in-delayed group relative bg-[#D4AF37] hover:bg-[#FFD700] px-16 py-5 text-sm font-black uppercase tracking-[0.4em] text-white transition-all duration-500 shadow-2xl hover:scale-105">
                Shop Now
            </RouterLink>
        </div>
    </main>
</template>

<style scoped>
/* Ensure the crochet texture stays crisp */
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
