<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';
//console
const route = useRoute();
const router = useRouter();
const isEditing = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const errors = ref({});
const successMessage = ref('');

// NEW: Ref to hold the actual processed blob for Appwrite upload
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
            initialData.value = {
                name: product.name,
                price: product.price,
                category: product.category,
                description: product.description,
                url: product.url
            };
        }
    } catch (error) {
        console.error("Product fetch failed:", error);
        router.push('/products');
    } finally {
        isLoading.value = false;
    }
});

const handleCategoryInput = (e) => {
    form.value.category = e.target.value.replace(/[^A-Za-z\s]/g, '');
};

const validateForm = () => {
    const newErrors = {};
    const alphaRegex = /^[A-Za-z\s]+$/;

    const name = form.value.name || initialData.value.name;
    const price = form.value.price !== null ? form.value.price : initialData.value.price;
    const category = form.value.category || initialData.value.category;
    const description = form.value.description || initialData.value.description;

    if (!name?.trim()) newErrors.name = "Product name is required";
    if (price <= 0) newErrors.price = "Price must be greater than 0";
    if (!category?.trim()) {
        newErrors.category = "Category is required";
    } else if (!alphaRegex.test(category)) {
        newErrors.category = "Only alphabets allowed";
    }
    if (description?.length < 10) newErrors.description = "Description too short";

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
                // Store the actual blob file for later upload
                rawFile.value = new File([blob], "product.webp", { type: "image/webp" });

                if (form.value.url?.startsWith('blob:')) URL.revokeObjectURL(form.value.url);
                form.value.url = URL.createObjectURL(blob);
                delete errors.value.url;
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

    if (validateForm()) {
        isSaving.value = true;
        try {
            let uploadedUrl = form.value.url || initialData.value.url;

            // 1. If we have a new processed file, upload it to Appwrite Storage first
            if (rawFile.value) {
                uploadedUrl = await AppwriteService.uploadFile(rawFile.value);
            }

            // 2. Prepare the database update payload
            const updateData = {
                name: form.value.name || initialData.value.name,
                price: Number(form.value.price !== null ? form.value.price : initialData.value.price),
                category: form.value.category || initialData.value.category,
                description: form.value.description || initialData.value.description,
                url: uploadedUrl // Use the newly generated Storage URL
            };

            await AppwriteService.editProduct(route.params.id, updateData);

            successMessage.value = "Changes saved successfully! Redirecting...";
            isEditing.value = false;

            setTimeout(() => {
                const cleanCat = updateData.category.toLowerCase().replace(/\s+/g, '-');
                router.push(`/products/${cleanCat}/${route.params.id}`);
            }, 2000);
        } catch (error) {
            console.error("Update failed:", error);
            errors.value.submit = error.message || "Failed to update. Check console for details.";
        } finally {
            isSaving.value = false;
        }
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

        <div v-if="errors.submit" class="mb-8 p-4 bg-red-50 border border-red-200 rounded-md text-center">
            <p class="text-red-600 text-[10px] font-bold uppercase tracking-widest">{{ errors.submit }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-8">
            <div class="flex flex-col gap-4">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Image</label>
                <div class="aspect-square w-full overflow-hidden rounded-[10px] bg-gray-50 border-2 border-dashed flex items-center justify-center relative group"
                    :class="errors.url ? 'border-red-400' : 'border-gray-200'">
                    <img v-if="form.url || initialData.url" :src="form.url || initialData.url"
                        class="w-full h-full object-cover" />
                    <div v-if="isEditing"
                        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label for="file-upload"
                            class="cursor-pointer bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm">Change
                            Image</label>
                    </div>
                </div>
                <input type="file" id="file-upload" class="hidden" accept="image/*" :disabled="!isEditing"
                    @change="handleFileChange" />
            </div>

            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Name</label>
                <input :disabled="!isEditing" v-model="form.name" type="text" :placeholder="initialData.name"
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50 placeholder:text-gray-300">
            </div>

            <div class="grid grid-cols-2 gap-6">
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Price (₦)</label>
                    <input :disabled="!isEditing" v-model="form.price" type="number" step="0.01"
                        :placeholder="initialData.price"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50">
                </div>
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Category</label>
                    <input :disabled="!isEditing" v-model="form.category" type="text"
                        :placeholder="initialData.category" @input="handleCategoryInput"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors text-base disabled:bg-gray-50">
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Description</label>
                <textarea :disabled="!isEditing" v-model="form.description" :placeholder="initialData.description"
                    class="border-gray-200 border-2 h-32 p-4 focus:border-black outline-none transition-colors text-base resize-none disabled:bg-gray-50"></textarea>
            </div>

            <button type="submit" :disabled="isSaving"
                class="bg-black text-white w-full py-4 text-sm font-black tracking-[0.2em] hover:bg-gray-800 transition-all uppercase disabled:opacity-50">
                {{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Product') }}
            </button>
        </form>
    </section>
</template>
