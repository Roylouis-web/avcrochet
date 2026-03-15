<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const router = useRouter();
const isEditing = ref(false);
const isLoading = ref(true);
const errors = ref({});
const successMessage = ref('');

// Local form state
const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    address: ''
});

// 1. Fetch User and Profile on Mount
onMounted(async () => {
    try {
        // Use your service's helper method instead of raw database calls.
        // getFullUser() internally handles the TablesDB.getRow call for you.
        const user = await AppwriteService.getFullUser();

        if (!user) {
            router.push('/login');
            return;
        }

        form.value = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email,
            telephone: user.telephone || '',
            address: user.address || ''
        };
    } catch (error) {
        console.error("Failed to load profile:", error);
    } finally {
        isLoading.value = false;
    }
});

const validateForm = () => {
    const newErrors = {};
    const alphaRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.value.firstName?.trim()) newErrors.firstName = "First Name is required";
    else if (!alphaRegex.test(form.value.firstName)) newErrors.firstName = "Only alphabets allowed";

    if (!form.value.lastName?.trim()) newErrors.lastName = "Last Name is required";
    else if (!alphaRegex.test(form.value.lastName)) newErrors.lastName = "Only alphabets allowed";

    if (!form.value.email?.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.value.email)) newErrors.email = "Invalid email format";

    if (!form.value.telephone?.trim()) newErrors.telephone = "Telephone is required";
    if (!form.value.address?.trim()) newErrors.address = "Address is required";

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

// 2. Handle Update Logic
const handleUpdate = async () => {
    if (!isEditing.value) {
        isEditing.value = true;
        return;
    }

    if (validateForm()) {
        try {
            // Get the current user data to ensure we have the correct ID
            const user = await AppwriteService.getFullUser();

            // A. Update Auth Name (Uses object parameters for latest SDK)
            await AppwriteService.account.updateName({
                name: `${form.value.firstName} ${form.value.lastName}`
            });

            // B. Update Database Profile via your service method
            // This method internally uses tables.updateRow correctly
            await AppwriteService.editUser(user.$id, {
                firstName: form.value.firstName,
                lastName: form.value.lastName,
                telephone: form.value.telephone,
                address: form.value.address
            });

            isEditing.value = false;
            successMessage.value = "Details updated successfully! Logging out for security...";

            // 3. Logout and Redirect
            setTimeout(async () => {
                await AppwriteService.logout();
                router.push('/login');
            }, 2000);

        } catch (error) {
            console.error("Update failed:", error);
            errors.value.submit = "Failed to update profile. Please try again.";
        }
    }
};
</script>

<template>
    <div v-if="isLoading" class="flex justify-center items-center min-h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>

    <section v-else class="mx-auto w-[90%] sm:w-[65%] lg:w-[40%] mt-12 mb-20">
        <header class="text-center mb-12">
            <h1 class="text-3xl font-bold uppercase tracking-tight text-[#3A3A3A]">
                {{ isEditing ? 'Edit Your Details' : 'Account Profile' }}
            </h1>
        </header>

        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p class="text-green-600 text-sm font-bold uppercase tracking-wider text-center">
                {{ successMessage }}
            </p>
        </div>

        <div v-if="errors.submit" class="mb-6 text-red-500 text-xs font-bold uppercase text-center">
            {{ errors.submit }}
        </div>

        <div class="flex flex-col gap-8">
            <div class="grid grid-cols-2 gap-6">
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">First Name</label>
                    <input :disabled="!isEditing" v-model="form.firstName" type="text"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                        :class="{ 'border-red-400': errors.firstName }">
                </div>
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Last Name</label>
                    <input :disabled="!isEditing" v-model="form.lastName" type="text"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                        :class="{ 'border-red-400': errors.lastName }">
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Email Address</label>
                <input disabled v-model="form.email" type="email"
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base bg-gray-50">
                <p class="text-[9px] text-gray-400 uppercase font-bold tracking-tighter mt-1">
                    Email changes require security verification.
                </p>
            </div>

            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Telephone</label>
                <input :disabled="!isEditing" v-model="form.telephone" type="tel"
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                    :class="{ 'border-red-400': errors.telephone }">
            </div>

            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Delivery Address</label>
                <textarea :disabled="!isEditing" v-model="form.address"
                    class="border-gray-200 border-2 h-32 p-4 focus:border-black outline-none transition-colors text-base resize-none disabled:bg-gray-50"
                    :class="{ 'border-red-400': errors.address }"></textarea>
            </div>

            <div class="mt-4">
                <button @click="handleUpdate"
                    class="bg-black text-white w-full py-4 text-sm font-black tracking-[0.2em] hover:bg-gray-800 transition-all uppercase">
                    {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
                </button>
            </div>
        </div>
    </section>
</template>
