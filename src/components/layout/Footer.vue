<template>
  <footer
    class="border-t border-gray-900 bg-black font-['Helvetica','Arial',sans-serif] text-[#D4AF37] p-8 flex-col md:flex">

    <!-- Quick Links Section -->
    <nav class="flex flex-col gap-4 mb-12 mt-8">
      <h4 class="font-black uppercase tracking-widest text-white">Quick links</h4>
      <div class="flex flex-col md:flex-row gap-6 opacity-80">
        <!-- Added About Link -->
        <RouterLink to="/about" class="hover:opacity-100 hover:text-white transition-all uppercase tracking-tighter">
          About Our Story</RouterLink>

        <RouterLink to="/faq" class="hover:opacity-100 hover:text-white transition-all">Frequently Asked Questions
        </RouterLink>
        <RouterLink to="/contact" class="hover:opacity-100 hover:text-white transition-all">Contact</RouterLink>
        <RouterLink to="/refund-policy" class="hover:opacity-100 hover:text-white transition-all">Refund Policy
        </RouterLink>
      </div>
    </nav>

    <!-- Subscription Section -->
    <aside class="mt-4">
      <h4 class="font-black uppercase tracking-widest text-white">Be notified when I release new patterns!</h4>

      <form class="flex flex-col gap-2 mt-4 sm:flex-row w-full">
        <input type="email" name="email" id="footer-email" placeholder="Email address" required
          class="bg-gray-900 border border-gray-800 md:w-4/5 px-4 py-2 w-full text-white outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-500" />

        <button type="submit"
          class="font-bold bg-[#D4AF37] px-6 py-2 text-black flex items-center justify-center hover:bg-yellow-600 transition-all uppercase tracking-tighter">
          SUBSCRIBE
        </button>
      </form>
    </aside>
  </footer>
</template>
