<template>
  <footer
    class="border-t-2 border-[#F6F6F6] bg-[#80808034] font-['Helvetica','Arial',sans-serif] text-[#3A3A3A] p-8 flex-col md:flex">
    <nav class="flex flex-col gap-4 mb-12 mt-8">
      <h4 class="font-black">Quick links</h4>
      <div class="flex flex-col md:flex-row gap-6">
        <RouterLink to="/faq">Frequently Asked Questions</RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
      </div>
    </nav>
    <aside class="mt-4">
      <h4 class="font-black">Be notified when I release new patterns!</h4>

      <!-- 
        1. action: Set this to your Formspree email endpoint.
        2. method: MUST be "POST".
      -->
      <form action="https://formspree.io" method="POST" class="flex flex-col gap-2 mt-4 sm:flex-row w-full">
        <!-- 
          OPTIONAL: Redirects back to your page after submission.
          Replace the value with your actual website URL.
        -->
        <input type="hidden" name="_next" value="https://yourwebsite.com">

        <input type="email" name="email" id="footer-email" placeholder="Email address" required
          class="border border-amber-50 md:w-4/5 px-4 py-2 w-full text-black outline-none focus:border-[#3A3A3A] transition-colors" />

        <button type="submit"
          class="font-[13px] bg-[#3A3A3A] px-4 py-2 text-white flex items-center justify-center hover:bg-black transition-all">
          SUBSCRIBE
        </button>
      </form>
    </aside>
  </footer>
</template>