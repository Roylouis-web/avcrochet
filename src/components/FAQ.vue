<script setup>
import { ref } from 'vue'

const activeId = ref(null)

const faqs = [
    {
        id: 1,
        question: "How long does a custom crochet outfit take?",
        answer: "Each piece is handmade with love. Typically, orders take 7-14 business days to crochet and ship, depending on the complexity of the design."
    },
    {
        id: 2,
        question: "What materials do you use for your outfits?",
        answer: "We primarily use high-quality cotton and soft acrylic blends that are breathable, skin-friendly, and perfect for both beachwear and daily outfits."
    },
    {
        id: 3,
        question: "How should I wash my crochet clothes?",
        answer: "Hand washing in cold water with mild detergent is best. Lay flat to dry on a towel to maintain the shape and prevent stretching."
    },
    {
        id: 4,
        question: "Do you take custom size requests?",
        answer: "Yes! Since everything is handmade, you can provide your specific measurements in the 'Notes' section at checkout for a perfect fit."
    }
]

const toggleFaq = (id) => {
    activeId.value = activeId.value === id ? null : id
}
</script>

<template>
    <section class="mx-auto max-w-2xl px-6 py-16 mb-20">
        <header>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight uppercase text-center mb-12 text-[#3A3A3A]">
                Frequently Asked Questions
            </h1>
        </header>

        <div class="border-t border-gray-100">
            <div v-for="faq in faqs" :key="faq.id" class="border-b border-gray-100">
                <button @click="toggleFaq(faq.id)"
                    class="flex w-full items-center justify-between py-6 text-left transition-all group">
                    <span class="text-sm md:text-base font-bold uppercase tracking-wider text-[#3A3A3A]">
                        {{ faq.question }}
                    </span>

                    <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="size-4 text-gray-400 transition-transform duration-500"
                        :class="{ 'rotate-180 text-black': activeId === faq.id }">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                <Transition name="fade-slide">
                    <div v-if="activeId === faq.id" class="pb-8 pr-6 text-base leading-relaxed text-gray-500">
                        {{ faq.answer }}
                    </div>
                </Transition>
            </div>
        </div>
    </section>
</template>

<style scoped>
.fade-slide-enter-active {
    transition: all 0.4s ease-out;
}

.fade-slide-leave-active {
    transition: all 0.2s ease-in;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>

