<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const route = useRoute();
const router = useRouter();
const isEditing = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const errors = ref({}); // Used to store validation messages
const successMessage = ref('');
const rawFile = ref(null);

const form = ref({
    name: '',
    price: null,
    category: '',
    description: '',
    url: ''
});

const initialData = ref({
    name: '',
    price: 0,
    category: '',
    description: '',
    url: ''
});

onMounted(async () => {
    try {
        const product = await AppwriteService.getProduct(route.params.id);
        if (product) {
            const data = {
                name: product.name,
                price: product.price,
                category: product.category,
                description: product.description,
                url: product.url
            };
            initialData.value = { ...data };
            form.value = { ...data };
        }
    } catch (error) {
        console.error("Product fetch failed:", error);
        router.push('/products');
    } finally {
        isLoading.value = false;
    }
});

// STRENGTHENED VALIDATION LOGIC
const validateForm = () => {
    const newErrors = {};
    const alphaRegex = /^[A-Za-z\s]+$/;

    if (!form.value.name?.trim()) {
        newErrors.name = "Product name is required";
    }

    if (form.value.price === null || form.value.price === undefined || form.value.price <= 0) {
        newErrors.price = "Valid price is required";
    }

    if (!form.value.category?.trim()) {
        newErrors.category = "Category is required";
    } else if (!alphaRegex.test(form.value.category)) {
        newErrors.category = "Category should only contain letters";
    }

    if (!form.value.description?.trim()) {
        newErrors.description = "Description is required";
    } else if (form.value.description.length < 10) {
        newErrors.description = "Description must be at least 10 characters";
    }

    if (!form.value.url) {
        newErrors.url = "Product image is required";
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                rawFile.value = new File([blob], "product.webp", { type: "image/webp" });
                if (form.value.url?.startsWith('blob:')) URL.revokeObjectURL(form.value.url);
                form.value.url = URL.createObjectURL(blob);
                // Clear image error if file is selected
                if (errors.value.url) delete errors.value.url;
            }, 'image/webp', 0.8);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

const handleSubmit = async () => {
    if (!isEditing.value) {
        isEditing.value = true;
        return;
    }

    // Stop submission if validation fails
    if (!validateForm()) return;

    isSaving.value = true;
    try {
        const updateData = {};

        if (form.value.name !== initialData.value.name) updateData.name = form.value.name;
        if (Number(form.value.price) !== initialData.value.price) updateData.price = Number(form.value.price);
        if (form.value.category !== initialData.value.category) updateData.category = form.value.category;
        if (form.value.description !== initialData.value.description) updateData.description = form.value.description;

        if (rawFile.value) {
            updateData.url = await AppwriteService.uploadFile(rawFile.value);
        }

        if (Object.keys(updateData).length > 0) {
            await AppwriteService.editProduct(route.params.id, updateData);
            successMessage.value = "Changes saved! Redirecting...";
        } else {
            successMessage.value = "No changes detected. Redirecting...";
        }

        isEditing.value = false;

        setTimeout(() => {
            const cleanCat = (updateData.category || initialData.value.category)
                .toLowerCase()
                .replace(/\s+/g, '-');
            router.push(`/products/${cleanCat}/${route.params.id}`);
        }, 2500);

    } catch (error) {
        console.error("Update failed:", error);
        errors.value.submit = error.message || "Update failed.";
    } finally {
        isSaving.value = false;
    }
};
</script>

<template>
    <div v-if="isLoading" class="flex justify-center items-center h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>

    <section v-else class="mx-auto w-[90%] sm:w-[65%] lg:w-[40%] mt-12 mb-20">
        <header class="text-center mb-12">
            <h1 class="text-3xl font-bold uppercase tracking-tight text-[#3A3A3A]">
                {{ isEditing ? 'Editing Product' : 'Product Details' }}
            </h1>
        </header>

        <!-- Success/Global Error Messages -->
        <div v-if="successMessage" class="mb-8 p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <p class="text-green-600 text-[10px] font-bold uppercase tracking-widest">{{ successMessage }}</p>
        </div>

        <div v-if="errors.submit" class="mb-8 p-4 bg-red-50 border border-red-200 rounded-md text-center">
            <p class="text-red-600 text-[10px] font-bold uppercase tracking-widest">{{ errors.submit }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-8">
            <!-- Image Field -->
            <div class="flex flex-col gap-4">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Image</label>
                <div class="aspect-square w-full overflow-hidden rounded-[10px] bg-gray-50 border-2 border-dashed flex items-center justify-center relative group"
                    :class="errors.url ? 'border-red-500' : 'border-gray-200'">
                    <img v-if="form.url" :src="form.url" class="w-full h-full object-cover" />
                    <div v-if="isEditing"
                        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label for="file-upload"
                            class="cursor-pointer bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm">Change
                            Image</label>
                    </div>
                </div>
                <p v-if="errors.url" class="text-red-500 text-[10px] font-bold uppercase">{{ errors.url }}</p>
                <input type="file" id="file-upload" class="hidden" accept="image/*" :disabled="!isEditing"
                    @change="handleFileChange" />
            </div>

            <!-- Name Field -->
            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Name</label>
                <input :disabled="!isEditing" v-model="form.name" type="text"
                    class="border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                    :class="errors.name ? 'border-red-500' : 'border-gray-200'">
                <p v-if="errors.name" class="text-red-500 text-[10px] font-bold uppercase">{{ errors.name }}</p>
            </div>

            <div class="grid grid-cols-2 gap-6">
                <!-- Price Field -->
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Price (₦)</label>
                    <input :disabled="!isEditing" v-model="form.price" type="number" step="0.01"
                        class="border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                        :class="errors.price ? 'border-red-500' : 'border-gray-200'">
                    <p v-if="errors.price" class="text-red-500 text-[10px] font-bold uppercase">{{ errors.price }}</p>
                </div>

                <!-- Category Field -->
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Category</label>
                    <input :disabled="!isEditing" v-model="form.category" type="text"
                        class="border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                        :class="errors.category ? 'border-red-500' : 'border-gray-200'">
                    <p v-if="errors.category" class="text-red-500 text-[10px] font-bold uppercase">{{ errors.category }}
                    </p>
                </div>
            </div>

            <!-- Description Field -->
            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Description</label>
                <textarea :disabled="!isEditing" v-model="form.description"
                    class="border-2 h-32 p-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50 resize-none"
                    :class="errors.description ? 'border-red-500' : 'border-gray-200'"></textarea>
                <p v-if="errors.description" class="text-red-500 text-[10px] font-bold uppercase">{{ errors.description
                    }}</p>
            </div>

            <!-- Submit Button -->
            <button type="submit" :disabled="isSaving"
                class="bg-black text-white py-4 px-12 text-sm font-black tracking-widest hover:bg-gray-800 transition-all duration-300 w-full disabled:bg-gray-400">
                {{ isSaving ? 'SAVING...' : (isEditing ? 'SAVE CHANGES' : 'EDIT PRODUCT') }}
            </button>
        </form>
    </section>
</template>
