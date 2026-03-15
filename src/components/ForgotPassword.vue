<script setup>
import { ref } from 'vue';
import AppwriteService from '@/services/AppwriteService';

const email = ref('');
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

const handleRequestReset = async () => {
    if (!email.value) {
        error.value = "Please enter your email address.";
        return;
    }

    loading.value = true;
    error.value = '';
    successMessage.value = '';

    try {
        // Step 1: Send recovery email
        // Replace 'http://localhost:5173/reset-password' with your actual production URL
        await AppwriteService.account.createRecovery(
            email.value,
            'http://localhost:5173/reset-password'
        );

        successMessage.value = "Recovery email sent! Please check your inbox.";
        email.value = ''; // Clear form
    } catch (err) {
        error.value = err.message || "Failed to send recovery email. Please try again.";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="mx-auto w-[95%] sm:w-[65%] lg:w-[40%] mt-12 mb-24">
        <header class="text-center mb-10">
            <h1 class="text-3xl font-bold uppercase tracking-tight text-[#3A3A3A]">Forgot Password</h1>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                We'll send a reset link to your inbox
            </p>
        </header>

        <!-- Status Alerts -->
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded text-center">
            <p class="text-green-600 text-xs font-bold uppercase tracking-widest">{{ successMessage }}</p>
        </div>
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded text-center">
            <p class="text-red-600 text-xs font-bold uppercase tracking-widest">{{ error }}</p>
        </div>

        <form @submit.prevent="handleRequestReset" class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
                <label class="text-xs font-black uppercase tracking-wider" for="email">Email Address</label>
                <input v-model="email" required type="email" id="email" placeholder="Enter your registered email"
                    class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors">
            </div>

            <div class="text-center mt-4 flex flex-col gap-4">
                <button :disabled="loading"
                    class="bg-black text-white py-4 px-12 text-xs font-black tracking-[0.2em] uppercase hover:bg-gray-800 transition-all disabled:bg-gray-400 w-full">
                    {{ loading ? 'Sending...' : 'Send Reset Link' }}
                </button>

                <RouterLink to="/login"
                    class="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 text-gray-500 hover:text-black">
                    Back to Login
                </RouterLink>
            </div>
        </form>
    </div>
</template>
