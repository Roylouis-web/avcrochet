<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const router = useRouter();
const errors = ref({});
const successMessage = ref('');
const isPublishing = ref(false);

const rawFiles = ref([]);
const previewUrls = ref([]);

const form = ref({
    name: '',
    price: null,
    category: '',
    subCategory: '', // Added for Appwrite
    description: '',
});

const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (!selectedFiles.length) return;

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
                    const processedFile = new File([blob], `${form.value.name || 'product'}-${Date.now()}.webp`, { type: "image/webp" });
                    rawFiles.value.push(processedFile);
                    previewUrls.value.push(URL.createObjectURL(blob));
                    delete errors.value.submit;
                }, 'image/webp', 0.8);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls.value[index]);
    previewUrls.value.splice(index, 1);
    rawFiles.value.splice(index, 1);
};

const handleCreate = async () => {
    if (
        !form.value.name?.trim() ||
        !form.value.price ||
        rawFiles.value.length === 0 ||
        !form.value.category?.trim() ||
        !form.value.subCategory || // Added validation
        !form.value.description?.trim()
    ) {
        errors.value.submit = "Please fill in all fields and upload at least one image.";
        return;
    }

    isPublishing.value = true;
    try {
        const uploadPromises = rawFiles.value.map(file => AppwriteService.uploadFile(file));
        const uploadedUrls = await Promise.all(uploadPromises);

        const productData = {
            name: form.value.name,
            price: Number(form.value.price),
            description: form.value.description,
            category: form.value.category.toLowerCase(),
            subCategory: form.value.subCategory, // Added to data object
            urls: JSON.stringify(uploadedUrls)
        };

        await AppwriteService.createProduct(productData);

        successMessage.value = "Product published successfully!";
        setTimeout(() => router.push('/products'), 2000);
    } catch (error) {
        console.error("Publishing Error:", error);
        errors.value.submit = error.message || "Failed to publish product.";
    } finally {
        isPublishing.value = false;
    }
};
</script>

<template>
    <section class="mx-auto w-[90%] sm:w-[65%] lg:w-[50%] mt-12 mb-20 text-left">
        <header class="text-center mb-12">
            <h1 class="text-3xl font-bold uppercase tracking-tight text-[#3A3A3A]">Add New Product</h1>
        </header>

        <div v-if="successMessage" class="mb-8 p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <p class="text-green-600 text-xs font-bold uppercase tracking-widest">{{ successMessage }}</p>
        </div>

        <p v-if="errors.submit" class="mb-6 text-center text-red-500 text-[10px] font-bold uppercase">{{ errors.submit
            }}</p>

        <form @submit.prevent="handleCreate" class="flex flex-col gap-8">
            <!-- Multiple Image Upload UI -->
            <div class="flex flex-col gap-4">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Images *</label>
                <div class="grid grid-cols-3 gap-2">
                    <div v-for="(url, index) in previewUrls" :key="index"
                        class="relative aspect-square rounded-md overflow-hidden border">
                        <img :src="url" class="w-full h-full object-cover" />
                        <button @click.prevent="removeImage(index)"
                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">✕</button>
                    </div>
                    <label for="file-upload"
                        class="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <span class="text-[20px] text-gray-400">+</span>
                        <span class="text-[8px] font-bold uppercase text-gray-400">Add</span>
                    </label>
                </div>
                <input type="file" id="file-upload" class="hidden" accept="image/*" multiple
                    @change="handleFileChange" />
            </div>

            <!-- Name -->
            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Name *</label>
                <input v-model="form.name" type="text" placeholder="e.g. Silk Shrug"
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors">
            </div>

            <!-- Row: Price, Category, and Target (subCategory) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Price -->
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Price (₦) *</label>
                    <input v-model="form.price" type="number" step="0.01"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors">
                </div>
                <!-- Category -->
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Category *</label>
                    <input v-model="form.category" type="text" placeholder="e.g. Tops"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors">
                </div>
                <!-- subCategory (Target) -->
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Target *</label>
                    <select v-model="form.subCategory" required
                        class="border-gray-200 border-2 h-14 px-4 focus:border-black outline-none transition-colors bg-white cursor-pointer">
                        <option value="" disabled>Select Target</option>
                        <option value="Women">Women</option>
                        <option value="Men">Men</option>
                        <option value="Kids">Kids</option>
                        <option value="Unisex">Unisex</option>
                    </select>
                </div>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Description *</label>
                <textarea v-model="form.description" placeholder="Describe your product..."
                    class="border-gray-200 border-2 h-48 p-4 focus:border-black outline-none transition-colors resize-none"></textarea>
            </div>

            <button type="submit" :disabled="isPublishing"
                class="bg-black text-white py-4 text-sm font-black tracking-widest hover:bg-gray-800 transition-all uppercase disabled:opacity-50">
                {{ isPublishing ? 'Publishing...' : 'Publish Product' }}
            </button>
        </form>
    </section>
</template>
