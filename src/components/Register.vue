<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '', // Matches Appwrite attribute
    address: '',   // Matches Appwrite attribute
    password: ''
});

const handleRegister = async () => {
    loading.value = true;
    error.value = '';

    try {
        await AppwriteService.createUser({
            email: form.value.email,
            password: form.value.password,
            firstName: form.value.firstName,
            lastName: form.value.lastName,
            telephone: form.value.telephone, // Sent as telephone
            address: form.value.address,     // Sent as address
            role: 'user'
        });

        alert("Account created successfully!");
        router.push('/login');
    } catch (err) {
        error.value = err.message || "Registration failed. Please try again.";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <form @submit.prevent="handleRegister"
        class="mx-auto w-[90%] sm:w-[65%] lg:w-[40%] mt-12 mb-16 flex flex-col gap-6">
        <header>
            <h1 class="text-3xl font-bold uppercase tracking-tight text-center text-[#3A3A3A]">Create Account</h1>
            <p class="text-center text-gray-400 text-xs mt-2 uppercase tracking-widest">Join our crochet community</p>
        </header>

        <p v-if="error" class="text-red-500 text-xs font-bold text-center uppercase tracking-tighter">{{ error }}</p>

        <!-- Name Row -->
        <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
                <label class="text-xs font-black uppercase tracking-wider" for="first_name">First Name</label>
                <input v-model="form.firstName" required
                    class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors"
                    type="text" id="first_name">
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-xs font-black uppercase tracking-wider" for="last_name">Last Name</label>
                <input v-model="form.lastName" required
                    class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors"
                    type="text" id="last_name">
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <label class="text-xs font-black uppercase tracking-wider" for="email">Email</label>
            <input v-model="form.email" required
                class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors"
                type="email" id="email">
        </div>

        <!-- Telephone Field -->
        <div class="flex flex-col gap-2">
            <label class="text-xs font-black uppercase tracking-wider" for="telephone">Phone Number</label>
            <input v-model="form.telephone" required
                class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors" type="tel"
                id="telephone" placeholder="e.g. 08012345678">
        </div>

        <!-- Address Field -->
        <div class="flex flex-col gap-2">
            <label class="text-xs font-black uppercase tracking-wider" for="address">Delivery Address</label>
            <textarea v-model="form.address" required
                class="border-gray-200 border-2 h-24 p-4 focus:border-black outline-none transition-colors resize-none"
                id="address" placeholder="Full home or office address"></textarea>
        </div>

        <div class="flex flex-col gap-2">
            <label class="text-xs font-black uppercase tracking-wider" for="password">Password</label>
            <input v-model="form.password" required minlength="8"
                class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors"
                type="password" id="password">
            <p class="text-[9px] text-gray-400 uppercase font-bold">Minimum 8 characters</p>
        </div>

        <div class="text-center flex flex-col gap-4 mt-4">
            <button :disabled="loading"
                class="bg-black text-white py-4 px-8 rounded-sm text-xs font-black tracking-[0.2em] uppercase hover:bg-gray-800 transition-all disabled:bg-gray-400">
                {{ loading ? 'Creating...' : 'Create Account' }}
            </button>

            <p class="text-xs text-gray-500 font-medium">
                Already have an account?
                <RouterLink to="/login" class="text-black font-bold underline underline-offset-4">Login here
                </RouterLink>
            </p>
        </div>
    </form>
</template>
