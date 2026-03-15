<script setup>
const handleSend = () => {
    console.log("Message sent");
}
</script>

<template>
    <form @submit.prevent="handleSend" class="mx-auto w-[90%] sm:w-[65%] lg:w-[50%] mt-12 mb-16 flex flex-col gap-8">
        <section>
            <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-center py-6 uppercase">Contact</h1>
        </section>

        <p class="text-gray-700 text-lg leading-relaxed">
            If you can't find an answer to your question in our
            <RouterLink to="/faq"
                class="font-bold text-black underline underline-offset-4 hover:opacity-70 transition-opacity">
                FAQ
            </RouterLink>
            you can always send us a message.
        </p>

        <div class="gap-6 flex flex-col md:grid md:grid-cols-2">
            <div class="flex flex-col gap-3">
                <label for="name" class="text-xs font-black uppercase tracking-wider text-black">Name</label>
                <input type="text" name="name" id="name"
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base">
            </div>
            <div class="flex flex-col gap-3">
                <label for="email" class="text-xs font-black uppercase tracking-wider text-black">Email *</label>
                <input type="email" name="email" id="email" required
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base">
            </div>
        </div>

        <div class="flex flex-col gap-3">
            <label for="telephone" class="text-xs font-black uppercase tracking-wider text-black">Telephone</label>
            <input type="tel" name="telephone" id="telephone"
                class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base">
        </div>

        <div class="flex flex-col gap-3">
            <label for="message" class="text-xs font-black uppercase tracking-wider text-black">Message</label>
            <textarea name="message" id="message"
                class="border-gray-200 border-2 h-48 p-4 focus:border-black outline-none transition-colors text-base resize-none"></textarea>
        </div>

        <div>
            <button
                class="bg-black text-white py-4 px-12 text-sm font-black tracking-widest hover:bg-gray-800 transition-all duration-300 w-full sm:w-max">
                SEND MESSAGE
            </button>
        </div>
    </form>
</template>
