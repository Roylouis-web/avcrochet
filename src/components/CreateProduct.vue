<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppwriteService from '@/services/AppwriteService';

const router = useRouter();
const errors = ref({});
const successMessage = ref('');
const isPublishing = ref(false);
const rawFile = ref(null);

const form = ref({
    name: '',
    price: null,
    category: '',
    description: '',
    url: ''
});

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                rawFile.value = new File([blob], `${form.value.name || 'product'}.webp`, { type: "image/webp" });
                if (form.value.url?.startsWith('blob:')) URL.revokeObjectURL(form.value.url);
                form.value.url = URL.createObjectURL(blob);
                delete errors.value.url;
            }, 'image/webp', 0.8);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

const handleCreate = async () => {
    // UPDATED VALIDATION: Added description check
    if (
        !form.value.name?.trim() ||
        !form.value.price ||
        !rawFile.value ||
        !form.value.category?.trim() ||
        !form.value.description?.trim()
    ) {
        errors.value.submit = "Please fill in all fields (including description) and upload an image.";
        return;
    }

    isPublishing.value = true;
    try {
        const uploadedUrl = await AppwriteService.uploadFile(rawFile.value);

        const productData = {
            name: form.value.name,
            price: Number(form.value.price),
            description: form.value.description,
            category: form.value.category.toLowerCase(),
            url: uploadedUrl
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
    <section class="mx-auto w-[90%] sm:w-[65%] lg:w-[40%] mt-12 mb-20 text-left">
        <header class="text-center mb-12">
            <h1 class="text-3xl font-bold uppercase tracking-tight text-[#3A3A3A]">Add New Product</h1>
        </header>

        <div v-if="successMessage" class="mb-8 p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <p class="text-green-600 text-xs font-bold uppercase tracking-widest">{{ successMessage }}</p>
        </div>

        <p v-if="errors.submit" class="mb-6 text-center text-red-500 text-[10px] font-bold uppercase">{{ errors.submit
            }}</p>

        <form @submit.prevent="handleCreate" class="flex flex-col gap-8">
            <!-- Image Upload UI -->
            <div class="flex flex-col gap-4">
                <div
                    class="aspect-square w-full overflow-hidden rounded-[10px] bg-gray-50 border-2 border-dashed flex items-center justify-center relative group">
                    <img v-if="form.url" :src="form.url" class="w-full h-full object-cover" />
                    <div v-else class="text-center p-6 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        Upload Image</div>
                    <div
                        class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label for="file-upload"
                            class="cursor-pointer bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-md">Select
                            File</label>
                    </div>
                </div>
                <input type="file" id="file-upload" class="hidden" accept="image/*" @change="handleFileChange" />
            </div>

            <!-- Name -->
            <div class="flex flex-col gap-3">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Name *</label>
                <input v-model="form.name" type="text" placeholder="e.g. Silk Shrug"
                    class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors">
            </div>

            <div class="grid grid-cols-2 gap-6">
                <!-- Price -->
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Price (₦) *</label>
                    <input v-model="form.price" type="number" step="0.01"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors">
                </div>
                <!-- Category -->
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Category *</label>
                    <input v-model="form.category" type="text"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none transition-colors">
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
