<script setup lang="ts">
import { BookOpenText, Github } from 'lucide-vue-next'
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <NuxtLink class="brand" to="/" aria-label="曲园智答首页">
        <span class="brand-mark"><BookOpenText :size="21" aria-hidden="true" /></span>
        <span class="brand-copy"><strong>曲园智答</strong><span>QFNU KNOWLEDGE</span></span>
      </NuxtLink>
      <a class="header-link" href="https://github.com/GiantGKL/QFNUQA" target="_blank" rel="noopener noreferrer">
        <Github :size="18" aria-hidden="true" /><span>开源仓库</span>
      </a>
    </div>
  </header>
</template>
