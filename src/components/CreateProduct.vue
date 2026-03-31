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

const sizeList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const form = ref({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    // Now a single object mapping: { 'XS': null, 'S': null, ... }
    sizes: sizeList.reduce((acc, s) => ({ ...acc, [s]: null }), {})
});

const categories = [
    "Utility Items", "Seasonal Items", "Keychains & Charms", "Home Decors",
    "Bags & Purses", "Jewelry", "Hair Accessories", "Hoodies",
    "Sweaters", "Skirts", "Dresses", "Tops", "Shorts",
    "Beach wears", "Bikinis", "Trousers", "T-shirts", "Vests",
    "Jumpsuits", "Hats", "Two-Pieces", "Brallets", "Beanies"
];

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
    // Filter to only include keys that have a value
    const filledSizes = Object.fromEntries(
        Object.entries(form.value.sizes).filter(([_, price]) => price !== null && price !== '')
    );

    const hasNegativePrice = Object.values(filledSizes).some(price => price < 0);

    if (hasNegativePrice) {
        errors.value.submit = "Prices cannot be less than zero.";
        return;
    }

    if (
        !form.value.name?.trim() ||
        Object.keys(filledSizes).length === 0 ||
        rawFiles.value.length === 0 ||
        !form.value.category ||
        !form.value.subCategory ||
        !form.value.description?.trim()
    ) {
        errors.value.submit = "Please fill in all fields (including at least one size price) and upload an image.";
        return;
    }

    isPublishing.value = true;
    try {
        const uploadPromises = rawFiles.value.map(file => AppwriteService.uploadFile(file));
        const uploadedUrls = await Promise.all(uploadPromises);

        const productData = {
            name: form.value.name,
            description: form.value.description,
            category: form.value.category,
            subCategory: form.value.subCategory,
            urls: JSON.stringify(uploadedUrls),
            sizes: JSON.stringify(filledSizes) // Saves as {"S": 50, "M": 100}
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
    <section class="mx-auto w-[90%] sm:w-[85%] lg:w-[50%] mt-12 mb-20 text-left">
        <header class="text-center mb-12">
            <h1 class="text-3xl font-bold uppercase tracking-tight text-[#3A3A3A]">Add New Product</h1>
        </header>

        <div v-if="successMessage" class="mb-8 p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <p class="text-green-600 text-xs font-bold uppercase tracking-widest">{{ successMessage }}</p>
        </div>

        <p v-if="errors.submit"
            class="mb-6 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest italic border border-red-100 p-3">
            {{ errors.submit }}
        </p>

        <form @submit.prevent="handleCreate" class="flex flex-col gap-8">
            <!-- Image Upload UI -->
            <div class="flex flex-col gap-4">
                <label class="text-xs font-black uppercase tracking-wider text-black">Product Images *</label>
                <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    <div v-for="(url, index) in previewUrls" :key="index"
                        class="relative aspect-square rounded-md overflow-hidden border">
                        <img :src="url" class="w-full h-full object-cover" />
                        <button @click.prevent="removeImage(index)"
                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">✕</button>
                    </div>
                    <label for="file-upload"
                        class="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <span class="text-[20px] text-gray-400">+</span>
                    </label>
                </div>
                <input type="file" id="file-upload" class="hidden" accept="image/*" multiple
                    @change="handleFileChange" />
            </div>

            <!-- Basic Info Grid -->
            <div class="grid md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-black uppercase tracking-wider text-black">Product Name *</label>
                    <input v-model="form.name" type="text" placeholder="e.g. Silk Shrug"
                        class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-3">
                        <label class="text-xs font-black uppercase tracking-wider text-black">Category *</label>
                        <select v-model="form.category"
                            class="border-gray-200 border-2 h-14 px-4 bg-white cursor-pointer outline-none focus:border-black">
                            <option value="" disabled selected>Select</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-3">
                        <label class="text-xs font-black uppercase tracking-wider text-black">Target *</label>
                        <select v-model="form.subCategory"
                            class="border-gray-200 border-2 h-14 px-4 bg-white cursor-pointer outline-none focus:border-black">
                            <option value="" disabled selected>Select</option>
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
                <textarea v-model="form.description" rows="4" placeholder="Describe the item..."
                    class="border-gray-200 border-2 p-4 focus:border-black outline-none resize-none"></textarea>
            </div>

            <!-- SIZES & PRICES GRID -->
            <div class="border-t pt-8">
                <label class="text-xs font-black uppercase tracking-wider text-black block mb-6">Pricing per Size
                    (₦)</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div v-for="size in sizeList" :key="size" class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ size }}
                            Price</label>
                        <input v-model="form.sizes[size]" type="number" placeholder="0.00"
                            class="border-gray-200 border-2 h-14 pl-4 focus:border-black outline-none">
                    </div>
                </div>
            </div>

            <button type="submit" :disabled="isPublishing"
                class="mt-8 bg-black text-white h-16 font-black uppercase tracking-[0.2em] text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400">
                {{ isPublishing ? 'Publishing...' : 'Publish Product' }}
            </button>
        </form>
    </section>
</template>
