<template>
    <div class="animate-pulse border-2 border-[whitesmoke] rounded-xl mb-12 overflow-hidden shadow-sm">
        <!-- Header Skeleton -->
        <div class="bg-[whitesmoke] px-8 py-6 flex justify-between items-center">
            <div class="flex gap-12">
                <div class="space-y-2">
                    <div class="h-3 w-16 bg-gray-200 rounded"></div>
                    <div class="h-4 w-24 bg-gray-300 rounded"></div>
                </div>
                <div class="space-y-2">
                    <div class="h-3 w-16 bg-gray-200 rounded"></div>
                    <div class="h-4 w-32 bg-gray-300 rounded"></div>
                </div>
            </div>
            <div class="h-9 w-24 bg-gray-300 rounded"></div>
        </div>

        <!-- Items Skeleton -->
        <div class="p-8 flex flex-col gap-6">
            <div v-for="i in 2" :key="i" class="flex gap-6 items-center">
                <div class="w-16 h-16 bg-gray-200 rounded"></div>
                <div class="flex flex-col gap-2 flex-1">
                    <div class="h-4 w-48 bg-gray-200 rounded"></div>
                    <div class="h-3 w-20 bg-gray-100 rounded"></div>
                </div>
            </div>
        </div>
    </div>
</template>
