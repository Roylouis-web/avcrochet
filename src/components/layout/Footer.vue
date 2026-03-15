<template>
  <footer
    class="border-t-[2px] border-[#F6F6F6] bg-[#80808034] font-['Helvetica','Arial',sans-serif] text-[#3A3A3A] p-8 flex-col md:flex"
  >
    <nav class="flex flex-col gap-4 mb-12 mt-8">
      <h4 class="font-black">Quick links</h4>
      <div class="flex flex-col md:flex-row gap-6">
        <RouterLink to="/faq">Frequently Asked Questions</RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
      </div>
    </nav>
    <aside class="mt-4">
      <h4 class="font-black">Be notified when I release new patterns!</h4>
      <div class="flex flex-col gap-2 mt-4 sm:flex-row w-full">
        <input type="email" name="email" id="email" placeholder="Email address" class="border border-amber-50 md:w-4/5 px-4 py-2 w-full" />
        <button class="font-[13px] bg-[#3A3A3A] px-4 py-2 text-white flex items-center justify-center"><p>SUBSCRIBE</p></button>
      </div>
    </aside>
  </footer>
</template>
