<script setup lang="ts">
import type { NuxtError } from '#app'
import { AlertTriangle, ArrowLeft } from 'lucide-vue-next'

defineProps<{ error: NuxtError }>()

const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <main class="error-page">
    <div class="error-card">
      <AlertTriangle :size="34" aria-hidden="true" />
      <p class="eyebrow">{{ error.statusCode || 500 }}</p>
      <h1>{{ error.statusCode === 404 ? '页面没有找到' : '服务暂时开小差了' }}</h1>
      <p>{{ error.message || '请稍后重试，或返回首页继续浏览。' }}</p>
      <button class="button button-primary" type="button" @click="goHome">
        <ArrowLeft :size="18" />返回首页
      </button>
    </div>
  </main>
</template>
