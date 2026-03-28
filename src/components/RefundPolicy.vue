<template>
    <div class="bg-white min-h-screen text-black font-sans pt-20 pb-32">
        <!-- Page Header -->
        <header class="max-w-4xl mx-auto px-6 mb-16 text-center">
            <h1 class="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">Refund Policy</h1>
            <div class="h-1 w-20 bg-[#D4AF37] mx-auto"></div>
            <p class="mt-6 text-gray-500 uppercase tracking-widest text-xs">Last Updated: March 2026</p>
        </header>

        <!-- Content Body -->
        <main class="max-w-3xl mx-auto px-6 space-y-12 leading-relaxed text-gray-800">

            <!-- Section 1 -->
            <section>
                <h2 class="text-xl font-bold uppercase tracking-wide mb-4 text-black border-b border-gray-100 pb-2">
                    1. Overview
                </h2>
                <p>
                    At <strong>Avcroslay</strong>, we take immense pride in the craftsmanship of our handmade items.
                    Because each piece is made to order or created in small batches, we have specific guidelines
                    regarding returns and refunds to ensure the sustainability of our small business.
                </p>
            </section>

            <!-- Section 2 -->
            <section>
                <h2 class="text-xl font-bold uppercase tracking-wide mb-4 text-black border-b border-gray-100 pb-2">
                    2. Physical Items (Finished Products)
                </h2>
                <p class="mb-4">
                    We offer a <strong>14-day return window</strong> for finished physical products. To be eligible for
                    a return:
                </p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>The item must be in the same condition that you received it.</li>
                    <li>It must be unworn, unwashed, and in its original packaging.</li>
                    <li>Custom-made or personalized orders are <strong>exempt</strong> from returns unless they arrive
                        damaged.</li>
                </ul>
            </section>

            <!-- Section 3 -->
            <section>
                <h2 class="text-xl font-bold uppercase tracking-wide mb-4 text-black border-b border-gray-100 pb-2">
                    3. Digital Patterns
                </h2>
                <div class="bg-gray-50 p-6 border-l-4 border-[#D4AF37]">
                    <p class="font-bold mb-2">Important Note on Digital Goods:</p>
                    <p>
                        Due to the nature of digital downloads, all **Crochet Patterns** are
                        <strong>non-refundable</strong> once the file has been accessed or downloaded.
                        If you experience technical issues with your file, please contact us for a replacement link.
                    </p>
                </div>
            </section>

            <!-- Section 4 -->
            <section>
                <h2 class="text-xl font-bold uppercase tracking-wide mb-4 text-black border-b border-gray-100 pb-2">
                    4. Damages and Issues
                </h2>
                <p>
                    Please inspect your order upon reception. If the item is defective, damaged, or if you receive
                    the wrong item, contact us immediately at
                    <a href="mailto:support@avcrochet.com" class="text-[#D4AF37] underline">support@avcrochet.com</a>
                    so that we can evaluate the issue and make it right.
                </p>
            </section>

            <!-- Section 5 -->
            <section>
                <h2 class="text-xl font-bold uppercase tracking-wide mb-4 text-black border-b border-gray-100 pb-2">
                    5. Refunds
                </h2>
                <p>
                    Once we receive and inspect your return, we will notify you if the refund was approved.
                    If approved, you’ll be automatically refunded on your original payment method within 10 business
                    days.
                    Please remember it can take some time for your bank or credit card company to process the refund.
                </p>
            </section>

            <!-- CTA / Contact -->
            <footer class="pt-12 text-center">
                <p class="text-sm text-gray-500 mb-6">Have questions about your specific order?</p>
                <RouterLink to="/contact"
                    class="inline-block bg-black text-[#D4AF37] px-10 py-4 font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all">
                    Contact Support
                </RouterLink>
            </footer>

        </main>
    </div>
</template>

<script setup>
// No logic needed for a static policy page
</script>

<style scoped>
/* Ensure smooth typography */
h1,
h2 {
    letter-spacing: -0.02em;
}
</style>
