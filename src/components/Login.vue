<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

// New: State for toggling password visibility
const showPassword = ref(false);

const isEmailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

const handleLogin = async () => {
    error.value = '';

    if (!email.value || !password.value) {
        error.value = "All fields are required";
        return;
    }

    if (!isEmailValid(email.value)) {
        error.value = "Please enter a valid email";
        return;
    }

    loading.value = true;
    try {
        await AppwriteService.login(email.value, password.value);
        router.push('/');
    } catch (err) {
        error.value = err.message || "Invalid email or password";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <form @submit.prevent="handleLogin" class="mx-auto w-[90%] sm:w-[65%] lg:w-[40%] mt-12 mb-16 flex flex-col gap-6">
        <header>
            <h1 class="text-3xl font-bold uppercase tracking-tight text-center text-[#3A3A3A]">Login</h1>
        </header>

        <p v-if="error" class="text-red-500 text-xs font-bold text-center uppercase tracking-tighter">{{ error }}</p>

        <div class="flex flex-col gap-2">
            <label class="text-xs font-black uppercase tracking-wider" for="email">Email</label>
            <input v-model="email" required
                class="border-gray-200 border-2 h-12 pl-4 focus:border-black outline-none transition-colors"
                type="email" id="email">
        </div>

        <div class="flex flex-col gap-2">
            <label class="text-xs font-black uppercase tracking-wider" for="password">Password</label>
            <!-- Wrapper for relative positioning of the eye icon -->
            <div class="relative">
                <input v-model="password" required
                    class="border-gray-200 border-2 h-12 pl-4 pr-12 focus:border-black outline-none transition-colors w-full"
                    :type="showPassword ? 'text' : 'password'" id="password">

                <!-- Eye Icon Toggle Button -->
                <button type="button" @click="showPassword = !showPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    aria-label="Toggle password visibility">
                    <!-- Eye Open (Show Password) -->
                    <svg v-if="!showPassword" xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.644C3.301 8.844 7.428 6 12 6s8.699 2.844 9.964 5.678c.22.441.22.946 0 1.387C20.699 15.156 16.572 18 12 18s-8.699-2.844-9.964-5.678z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <!-- Eye Slashed (Hide Password) -->
                    <svg v-else xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                </button>
            </div>
        </div>

        <section class="text-center flex flex-col gap-4 mt-4">
            <button :disabled="loading"
                class="bg-black text-white py-4 px-8 rounded-sm text-xs font-black tracking-[0.2em] uppercase hover:bg-gray-800 transition-all disabled:bg-gray-400 w-full">
                {{ loading ? 'Signing In...' : 'Sign In' }}
            </button>

            <RouterLink to="/forgot_password"
                class="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">
                Forgot your password?
            </RouterLink>

            <div class="h-[1px] bg-gray-100 my-2"></div>

            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                New customer?
                <RouterLink to="/register" class="text-black underline underline-offset-4">Create account</RouterLink>
            </p>
        </section>
    </form>
</template>
