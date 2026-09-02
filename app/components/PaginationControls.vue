<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ change: [page: number] }>()
const pages = computed(() => {
  const start = Math.max(1, Math.min(props.page - 2, props.totalPages - 4))
  const end = Math.min(props.totalPages, Math.max(5, props.page + 2))
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
})
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="问答分页">
    <button class="page-button" type="button" :disabled="page <= 1" aria-label="上一页" @click="emit('change', page - 1)"><ChevronLeft :size="18" /></button>
    <button v-for="item in pages" :key="item" class="page-button" :class="{ active: item === page }" type="button" :aria-current="item === page ? 'page' : undefined" @click="emit('change', item)">{{ item }}</button>
    <button class="page-button" type="button" :disabled="page >= totalPages" aria-label="下一页" @click="emit('change', page + 1)"><ChevronRight :size="18" /></button>
  </nav>
</template>
