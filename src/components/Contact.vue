<script setup>
import { ref } from 'vue'

const formData = ref({
    name: '',
    email: '',
    telephone: '',
    message: ''
})

const status = ref('')
const handleSend = async () => {
    status.value = 'Sending...'

    try {
        // MUST include your specific form ID (e.g., /f/xbjponvq)
        const response = await fetch("https://formspree.io/f/mlgpwakv", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json" // Highly recommended for AJAX
            },
            body: JSON.stringify(formData.value)
        });

        if (response.ok) {
            status.value = "Message sent successfully!"
            // Reset form correctly by re-assigning the object
            formData.value = { name: '', email: '', telephone: '', message: '' }
        } else {
            // Formspree often returns detailed error JSON
            const data = await response.json()
            status.value = data.error || "Oops! There was a problem."
        }
    } catch (error) {
        status.value = "Error sending message. Check your connection."
    }
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
                <input v-model="formData.name" type="text" name="name" id="name"
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base">
            </div>
            <div class="flex flex-col gap-3">
                <label for="email" class="text-xs font-black uppercase tracking-wider text-black">Email *</label>
                <input v-model="formData.email" type="email" name="email" id="email" required
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base">
            </div>
        </div>

        <div class="flex flex-col gap-3">
            <label for="telephone" class="text-xs font-black uppercase tracking-wider text-black">Telephone</label>
            <input v-model="formData.telephone" type="tel" name="telephone" id="telephone"
                class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base">
        </div>

        <div class="flex flex-col gap-3">
            <label for="message" class="text-xs font-black uppercase tracking-wider text-black">Message</label>
            <textarea v-model="formData.message" name="message" id="message"
                class="border-gray-200 border-2 h-48 p-4 focus:border-black outline-none transition-colors text-base resize-none"></textarea>
        </div>

        <div>
            <button type="submit"
                class="bg-black text-white py-4 px-12 text-sm font-black tracking-widest hover:bg-gray-800 transition-all duration-300 w-full sm:w-max">
                SEND MESSAGE
            </button>
            <p v-if="status" class="mt-4 font-bold text-sm">{{ status }}</p>
        </div>
    </form>
</template>