<template>
    <div class="min-h-[80vh] flex flex-col items-center justify-center bg-white px-6">
        <div class="text-center">
            <!-- Sophisticated typography matching your product titles -->
            <h1 class="text-[120px] md:text-[160px] font-semibold leading-none text-[#3A3A3A] tracking-tighter">
                404
            </h1>

            <div class="w-16 h-1 bg-[#3A3A3A] mx-auto mb-8"></div>

            <h2 class="text-2xl md:text-3xl font-semibold text-[#3A3A3A] uppercase tracking-widest mb-4">
                Out of Stock
            </h2>

            <p class="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
                The page you are looking for has been moved, deleted, or never existed in our collection.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <!-- Matching your shop's link style -->
                <RouterLink to="/"
                    class="px-10 py-4 bg-[#3A3A3A] text-white font-bold uppercase text-xs tracking-[0.2em] hover:bg-black transition-colors duration-300 rounded-[4px]">
                    Back to Shop
                </RouterLink>

                <button @click="$router.go(-1)"
                    class="text-xs uppercase tracking-[0.2em] font-bold text-[#3A3A3A] hover:underline underline-offset-8">
                    Go Back
                </button>
            </div>
        </div>

        <!-- Minimal border detail matching your header/footer -->
        <div class="mt-20 border-t-2 border-[whitesmoke] w-[95%] md:w-[85%] text-center py-8">
            <p class="text-gray-400 text-[10px] uppercase tracking-[0.3em]">Lost? Contact Support</p>
        </div>
    </div>
</template>
