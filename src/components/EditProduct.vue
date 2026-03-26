<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const route = useRoute();
const router = useRouter();
const isEditing = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const errors = ref({});
const successMessage = ref('');

// Track new files to upload vs existing URLs
const rawFiles = ref([]);
const previewUrls = ref([]);

const form = ref({
    name: '',
    price: null,
    category: '',
    description: '',
});

const initialData = ref({});

onMounted(async () => {
    try {
        const product = await AppwriteService.getProduct(route.params.id);
        if (product) {
            // Parse the JSON string array from the database
            let existingUrls = [];
            try {
                existingUrls = product.urls ? JSON.parse(product.urls) : [];
            } catch (e) {
                // Fallback if it was a single string previously
                existingUrls = product.urls ? [product.urls] : [];
            }

            const data = {
                name: product.name,
                price: product.price,
                category: product.category,
                description: product.description,
            };

            initialData.value = { ...data, urls: JSON.stringify(existingUrls) };
            form.value = { ...data };
            previewUrls.value = [...existingUrls];
        }
    } catch (error) {
        console.error("Product fetch failed:", error);
        router.push('/products');
    } finally {
        isLoading.value = false;
    }
});

const validateForm = () => {
    const newErrors = {};
    if (!form.value.name?.trim()) newErrors.name = "Product name is required";
    if (!form.value.price || form.value.price <= 0) newErrors.price = "Valid price is required";
    if (!form.value.category?.trim()) newErrors.category = "Category is required";
    if (!form.value.description?.trim() || form.value.description.length < 10) {
        newErrors.description = "Description must be at least 10 characters";
    }
    if (previewUrls.value.length === 0) newErrors.urls = "At least one image is required";

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    const processedFile = new File([blob], "product.webp", { type: "image/webp" });
                    rawFiles.value.push(processedFile);
                    previewUrls.value.push(URL.createObjectURL(blob));
                    if (errors.value.urls) delete errors.value.urls;
                }, 'image/webp', 0.8);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

const removeImage = (index) => {
    if (!isEditing.value) return;
    const urlToRemove = previewUrls.value[index];
    if (urlToRemove.startsWith('blob:')) {
        // Find and remove from rawFiles if it's a new upload
        const rawIndex = rawFiles.value.findIndex(f => URL.createObjectURL(f) === urlToRemove);
        rawFiles.value.splice(rawIndex, 1);
        URL.revokeObjectURL(urlToRemove);
    }
    previewUrls.value.splice(index, 1);
};

const handleSubmit = async () => {
    if (!isEditing.value) {
        isEditing.value = true;
        return;
    }

    if (!validateForm()) return;

    isSaving.value = true;
    try {
        const updateData = {};

        // Compare simple fields
        if (form.value.name !== initialData.value.name) updateData.name = form.value.name;
        if (Number(form.value.price) !== initialData.value.price) updateData.price = Number(form.value.price);
        if (form.value.category !== initialData.value.category) updateData.category = form.value.category;
        if (form.value.description !== initialData.value.description) updateData.description = form.value.description;

        // Handle Images
        // 1. Keep existing URLs that weren't deleted
        const remainingExistingUrls = previewUrls.value.filter(url => !url.startsWith('blob:'));

        // 2. Upload new files
        const uploadPromises = rawFiles.value.map(file => AppwriteService.uploadFile(file));
        const newUploadedUrls = await Promise.all(uploadPromises);

        const finalUrlsArray = [...remainingExistingUrls, ...newUploadedUrls];
        const finalUrlsJson = JSON.stringify(finalUrlsArray);

        if (finalUrlsJson !== initialData.value.urls) {
            updateData.urls = finalUrlsJson;
        }

        if (Object.keys(updateData).length > 0) {
            await AppwriteService.editProduct(route.params.id, updateData);
            successMessage.value = "Changes saved! Redirecting...";
        } else {
            successMessage.value = "No changes detected. Redirecting...";
        }

        setTimeout(() => {
            const cleanCat = (updateData.category || initialData.value.category).toLowerCase().replace(/\s+/g, '-');
            router.push(`/products/${cleanCat}/${route.params.id}`);
        }, 2000);

    } catch (error) {
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

        <div v-if="successMessage" class="mb-8 p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <p class="text-green-600 text-[10px] font-bold uppercase tracking-widest">{{ successMessage }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-8">
            <!-- Image Field -->
            <div class="flex flex-col gap-4">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Images</label>
                <div class="grid grid-cols-3 gap-2">
                    <div v-for="(url, index) in previewUrls" :key="index"
                        class="relative aspect-square rounded-md overflow-hidden border">
                        <img :src="url" class="w-full h-full object-cover" />
                        <button v-if="isEditing" @click.prevent="removeImage(index)"
                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">✕</button>
                    </div>
                    <label v-if="isEditing" for="file-upload"
                        class="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <span class="text-[20px] text-gray-400">+</span>
                    </label>
                </div>
                <input type="file" id="file-upload" class="hidden" accept="image/*" multiple
                    @change="handleFileChange" />
                <p v-if="errors.urls" class="text-red-500 text-[10px] font-bold uppercase">{{ errors.urls }}</p>
            </div>

            <!-- Name Field -->
            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Name</label>
                <input :disabled="!isEditing" v-model="form.name" type="text"
                    class="border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                    :class="errors.name ? 'border-red-500' : 'border-gray-200'">
            </div>

            <!-- Price and Category -->
            <div class="grid grid-cols-2 gap-6">
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Price (₦)</label>
                    <input :disabled="!isEditing" v-model="form.price" type="number"
                        class="border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                        :class="errors.price ? 'border-red-500' : 'border-gray-200'">
                </div>
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Category</label>
                    <input :disabled="!isEditing" v-model="form.category" type="text"
                        class="border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50"
                        :class="errors.category ? 'border-red-500' : 'border-gray-200'">
                </div>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Description</label>
                <textarea :disabled="!isEditing" v-model="form.description"
                    class="border-2 h-48 p-4 focus:border-black outline-none transition-colors resize-none disabled:bg-gray-50"
                    :class="errors.description ? 'border-red-500' : 'border-gray-200'"></textarea>
            </div>

            <button type="submit" :disabled="isSaving"
                class="bg-black text-white py-4 text-sm font-black tracking-widest hover:bg-gray-800 transition-all uppercase disabled:opacity-50">
                {{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Product') }}
            </button>
        </form>
    </section>
</template>
