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

const rawFiles = ref([]);
const previewUrls = ref([]);

const sizeList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const categories = [
    "Utility Items", "Seasonal Items", "Keychains & Charms", "Home Decors",
    "Bags & Purses", "Jewelry", "Hair Accessories", "Hoodies",
    "Sweaters", "Skirts", "Dresses", "Tops", "Shorts",
    "Beach wears", "Bikinis", "Trousers", "T-shirts", "Vests",
    "Jumpsuits", "Hats", "Two-Pieces", "Brallets", "Beanies"
];

const form = ref({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    // Use an object for mapping sizes to prices directly
    sizes: sizeList.reduce((acc, s) => ({ ...acc, [s]: null }), {})
});

const initialData = ref({});

onMounted(async () => {
    try {
        const product = await AppwriteService.getProduct(route.params.id);
        if (product) {
            let existingUrls = [];
            let existingSizesObj = {};

            try {
                existingUrls = product.urls ? JSON.parse(product.urls) : [];
            } catch (e) { existingUrls = [product.urls]; }

            try {
                // Parse the existing mapping object (e.g. {"S": 100, "M": 200})
                existingSizesObj = product.sizes ? JSON.parse(product.sizes) : {};
            } catch (e) { existingSizesObj = {}; }

            // Map values into our standard XS-XXL list for the form
            const mergedSizes = sizeList.reduce((acc, s) => {
                acc[s] = existingSizesObj[s] !== undefined ? existingSizesObj[s] : null;
                return acc;
            }, {});

            const data = {
                name: product.name,
                category: product.category,
                subCategory: product.subCategory || '',
                description: product.description,
                sizes: mergedSizes
            };

            // Save state for comparison later
            initialData.value = {
                ...data,
                urlsJson: JSON.stringify(existingUrls),
                sizesJson: JSON.stringify(existingSizesObj)
            };

            form.value = JSON.parse(JSON.stringify(data));
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
    const filledEntries = Object.entries(form.value.sizes).filter(([_, price]) => price !== null && price !== '');

    if (!form.value.name?.trim()) newErrors.name = "Product name is required";
    if (!form.value.category) newErrors.category = "Category is required";
    if (!form.value.subCategory) newErrors.subCategory = "Target is required";
    if (filledEntries.length === 0) newErrors.submit = "At least one size must have a price";
    if (filledEntries.some(([_, price]) => price < 0)) newErrors.submit = "Prices cannot be less than zero";
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

        // Clean the mapping object (remove nulls) for saving
        const filledSizes = Object.fromEntries(
            Object.entries(form.value.sizes).filter(([_, price]) => price !== null && price !== '')
        );
        const finalSizesJson = JSON.stringify(filledSizes);

        if (form.value.name !== initialData.value.name) updateData.name = form.value.name;
        if (form.value.category !== initialData.value.category) updateData.category = form.value.category;
        if (form.value.subCategory !== initialData.value.subCategory) updateData.subCategory = form.value.subCategory;
        if (form.value.description !== initialData.value.description) updateData.description = form.value.description;

        if (finalSizesJson !== initialData.value.sizesJson) updateData.sizes = finalSizesJson;

        const remainingExistingUrls = previewUrls.value.filter(url => !url.startsWith('blob:'));
        const uploadPromises = rawFiles.value.map(file => AppwriteService.uploadFile(file));
        const newUploadedUrls = await Promise.all(uploadPromises);

        const finalUrlsArray = [...remainingExistingUrls, ...newUploadedUrls];
        const finalUrlsJson = JSON.stringify(finalUrlsArray);

        if (finalUrlsJson !== initialData.value.urlsJson) updateData.urls = finalUrlsJson;

        if (Object.keys(updateData).length > 0) {
            await AppwriteService.editProduct(route.params.id, updateData);
            successMessage.value = "Changes saved!";
        } else {
            successMessage.value = "No changes detected.";
        }

        setTimeout(() => {
            const cat = (updateData.category || initialData.value.category).toLowerCase().replace(/\s+/g, '-');
            router.push(`/products/${cat}/${route.params.id}`);
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

    <section v-else class="mx-auto w-[90%] sm:w-[85%] lg:w-[50%] mt-12 mb-20 text-left">
        <header class="text-center mb-12">
            <h1 class="text-3xl font-bold uppercase tracking-tight text-[#3A3A3A]">
                {{ isEditing ? 'Editing Product' : 'Product Details' }}
            </h1>
        </header>

        <div v-if="successMessage" class="mb-8 p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <p class="text-green-600 text-xs font-bold uppercase tracking-widest">{{ successMessage }}</p>
        </div>

        <p v-if="errors.submit"
            class="mb-6 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-100 p-3">
            {{ errors.submit }}
        </p>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-8">
            <!-- Image Field -->
            <div class="flex flex-col gap-4">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Images</label>
                <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    <div v-for="(url, index) in previewUrls" :key="index"
                        class="relative aspect-square rounded-md overflow-hidden border">
                        <img :src="url" class="w-full h-full object-cover" />
                        <button v-if="isEditing" @click.prevent="removeImage(index)"
                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">✕</button>
                    </div>
                    <label v-if="isEditing" for="file-upload"
                        class="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <span class="text-[20px] text-gray-400">+</span>
                    </label>
                </div>
                <input v-if="isEditing" type="file" id="file-upload" class="hidden" accept="image/*" multiple
                    @change="handleFileChange" />
            </div>

            <!-- Basic Info Grid -->
            <div class="grid md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Product Name *</label>
                    <input v-model="form.name" :disabled="!isEditing" type="text"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none disabled:bg-gray-50">
                    <p v-if="errors.name" class="text-red-500 text-[10px] uppercase font-bold">{{ errors.name }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-3">
                        <label class="text-xs font-black uppercase tracking-wider text-black">Category *</label>
                        <select v-model="form.category" :disabled="!isEditing"
                            class="border-gray-200 border-2 h-14 px-4 bg-white outline-none focus:border-black disabled:bg-gray-50">
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-3">
                        <label class="text-xs font-black uppercase tracking-wider text-black">Target *</label>
                        <select v-model="form.subCategory" :disabled="!isEditing"
                            class="border-gray-200 border-2 h-14 px-4 bg-white outline-none focus:border-black disabled:bg-gray-50">
                            <option value="Women">Women</option>
                            <option value="Men">Men</option>
                            <option value="Kids">Kids</option>
                            <option value="Unisex">Unisex</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Description *</label>
                <textarea v-model="form.description" :disabled="!isEditing" rows="4"
                    class="border-gray-200 border-2 p-4 focus:border-black outline-none resize-none disabled:bg-gray-50"></textarea>
                <p v-if="errors.description" class="text-red-500 text-[10px] uppercase font-bold">{{ errors.description
                    }}</p>
            </div>

            <!-- SIZES & PRICES GRID -->
            <div class="border-t pt-8">
                <label class="text-xs font-black uppercase tracking-wider text-black block mb-6">Pricing per Size
                    (₦)</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div v-for="size in sizeList" :key="size" class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ size }}
                            Price</label>
                        <input v-model="form.sizes[size]" :disabled="!isEditing" type="number" placeholder="0.00"
                            class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none disabled:bg-gray-50 transition-colors">
                    </div>
                </div>
            </div>

            <button type="submit" :disabled="isSaving"
                class="mt-8 bg-black text-white h-16 font-black uppercase tracking-[0.2em] text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400">
                {{ !isEditing ? 'Edit Product' : (isSaving ? 'Saving...' : 'Save Changes') }}
            </button>
        </form>
    </section>
</template>
