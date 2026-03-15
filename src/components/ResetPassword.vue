<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const error = ref('');
const successMessage = ref('');

const form = ref({
    password: '',
    retypePassword: ''
});

// Step 2: Appwrite provides userId and secret in the URL parameters
const userId = route.query.userId;
const secret = route.query.secret;

const handleReset = async () => {
    // 1. Validation
    if (!userId || !secret) {
        error.value = "Invalid or expired reset link.";
        return;
    }

    if (form.value.password.length < 8) {
        error.value = "Password must be at least 8 characters.";
        return;
    }

    if (form.value.password !== form.value.retypePassword) {
        error.value = "Passwords do not match.";
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        // 2. Call Appwrite Account service to update the recovery
        await AppwriteService.account.updateRecovery(
            userId,
            secret,
            form.value.password,
            form.value.password
        );

        successMessage.value = "Password reset successfully! Redirecting to login...";

        setTimeout(() => {
            router.push('/login');
        }, 3000);
    } catch (err) {
        error.value = err.message || "Failed to reset password. The link may have expired.";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="mx-auto w-[95%] sm:w-[65%] lg:w-[40%] mt-12 mb-24">
        <header class="text-center mb-10">
            <h1 class="text-3xl font-bold uppercase tracking-tight text-[#3A3A3A]">Set New Password</h1>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Enter your new secure password</p>
        </header>

        <!-- Success/Error Alerts -->
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded text-center">
            <p class="text-green-600 text-xs font-bold uppercase tracking-widest">{{ successMessage }}</p>
        </div>
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded text-center">
            <p class="text-red-600 text-xs font-bold uppercase tracking-widest">{{ error }}</p>
        </div>

        <form @submit.prevent="handleReset" class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
                <label class="text-xs font-black uppercase tracking-wider" for="password">New Password</label>
                <input v-model="form.password" required minlength="8"
                    class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors"
                    type="password" id="password">
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-xs font-black uppercase tracking-wider" for="retype_password">Retype Password</label>
                <input v-model="form.retypePassword" required
                    class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors"
                    type="password" id="retype_password">
            </div>

            <div class="text-center mt-4">
                <button :disabled="loading || successMessage"
                    class="bg-black text-white py-4 px-12 text-xs font-black tracking-[0.2em] uppercase hover:bg-gray-800 transition-all disabled:bg-gray-400 w-full sm:w-auto">
                    {{ loading ? 'Updating...' : 'Reset Password' }}
                </button>
            </div>
        </form>
    </div>
</template>
