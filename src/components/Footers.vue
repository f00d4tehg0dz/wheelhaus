<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t-4 border-brand-navy bg-brand-ink py-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p class="text-center font-body text-base leading-relaxed text-brand-cream sm:text-lg">
        Created by
        <a href="https://linktr.ee/adrianchrysanthou" target="_blank" rel="noopener" class="footer-link">Adrian Chrysanthou</a>,
        contributor
        <a href="https://github.com/Elte156" target="_blank" rel="noopener" class="footer-link">Elte156</a>,
        and steamAPI by
        <a href="https://cma.dk" target="_blank" rel="noopener" class="footer-link">CMAndersen</a>,
        powered by
        <a href="http://www.steampowered.com" target="_blank" rel="noopener" class="footer-link">Steam</a>.
        &copy; {{ year }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  color: #F4B821;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
  transition: color 0.15s ease, background-color 0.15s ease;
  padding: 1px 4px;
  border-radius: 4px;
}
.footer-link:hover,
.footer-link:focus {
  color: #FBF7EE;
  background-color: #E85A47;
  outline: none;
}
</style>
