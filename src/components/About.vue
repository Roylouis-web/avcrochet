<template>
    <div class="bg-white min-h-screen text-black font-sans pt-20 pb-32">
        <!-- Page Header -->
        <header class="max-w-4xl mx-auto px-6 mb-16 text-center">
            <h1 class="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">Our Story</h1>
            <div class="h-1 w-20 bg-[#D4AF37] mx-auto"></div>
            <p class="mt-6 text-gray-500 uppercase tracking-widest text-xs italic">Crafting modern heirlooms since 2022
            </p>
        </header>

        <!-- Main Content -->
        <main class="max-w-3xl mx-auto px-6 space-y-16 leading-relaxed text-gray-800">

            <!-- Hero Section / Intro -->
            <section class="text-center md:text-left">
                <p class="text-lg md:text-xl font-light leading-relaxed">
                    Welcome to <span class="font-bold text-black">Avcroslay</span>. We believe that true luxury lies in
                    the hands of the maker. What started as a personal passion for fiber arts has evolved into a curated
                    studio dedicated to modern crochet craftsmanship.
                </p>
            </section>

            <!-- Philosophy Grid -->
            <section class="grid md:grid-cols-2 gap-12 border-y border-gray-100 py-16">
                <div>
                    <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">The Craft</h2>
                    <p class="text-sm text-gray-600">
                        Every stitch is intentional. Unlike machine-made knits, crochet cannot be replicated by
                        industrial machinery. Each piece you find here is a product of hours of focused manual labor and
                        artistic intuition.
                    </p>
                </div>
                <div>
                    <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">The Material</h2>
                    <p class="text-sm text-gray-600">
                        We source premium natural fibers and sustainable yarns to ensure that our physical products
                        aren't just beautiful—they are durable, breathable, and kind to the planet.
                    </p>
                </div>
            </section>

            <!-- The Creator Section -->
            <section class="space-y-6">
                <h2 class="text-2xl font-bold uppercase tracking-tight text-black">Behind the Hook</h2>
                <div class="flex flex-col md:flex-row gap-8 items-center">
                    <div class="w-full md:w-1/3 aspect-[4/5] overflow-hidden bg-gray-100 border border-gray-200">
                        <!-- Replaced placeholder with your image -->
                        <img src="/my_hero.webp" alt="The Creator of Avcroslay"
                            class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out" />
                    </div>
                    <div class="w-full md:w-2/3">
                        <p class="mb-4 text-gray-700 italic">
                            "I created Avcroslay to bridge the gap between traditional craft and contemporary style. My
                            goal is to provide fellow creators with the patterns they need to build their own wardrobe,
                            while offering finished pieces to those who value handmade art."
                        </p>
                        <p class="font-bold text-black uppercase tracking-widest text-sm">— Founder & Lead Designer</p>
                    </div>
                </div>
            </section>

            <!-- Call to Action -->
            <footer class="pt-12 text-center">
                <div class="bg-black text-white p-12 space-y-6">
                    <h3 class="text-2xl font-bold uppercase tracking-tighter">Join the Creative Journey</h3>
                    <p class="text-gray-400 max-w-md mx-auto text-sm">
                        Whether you are here to shop our finished collection or to start your next DIY project with our
                        digital patterns, we're glad you're part of our community.
                    </p>
                    <div class="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <RouterLink to="/products"
                            class="bg-[#D4AF37] text-black px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors">
                            Shop Collection
                        </RouterLink>
                    </div>
                </div>
            </footer>

        </main>
    </div>
</template>

<script setup>
// Static component for brand storytelling
</script>

<style scoped>
h1,
h2,
h3 {
    letter-spacing: -0.02em;
}
</style>
