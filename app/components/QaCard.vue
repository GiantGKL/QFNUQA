<script setup lang="ts">
import { Clock3, Eye } from 'lucide-vue-next'
import type { QA } from '~/types'

const props = defineProps<{ qa: QA }>()
const emit = defineEmits<{ select: [id: number] }>()

const formatDate = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(new Date(value))
const select = () => emit('select', props.qa.id)
</script>

<template>
  <article class="qa-card" role="button" tabindex="0" :aria-label="`查看问答：${qa.question}`" @click="select" @keydown.enter="select" @keydown.space.prevent="select">
    <span v-if="qa.category_name" class="category">{{ qa.category_name }}</span>
    <h3>{{ qa.question }}</h3>
    <p class="qa-excerpt">{{ qa.answer }}</p>
    <div class="qa-footer">
      <div class="tag-row"><span v-for="tag in qa.tags.slice(0, 2)" :key="tag.id" class="chip">{{ tag.name }}</span></div>
      <div class="meta">
        <span><Eye :size="14" aria-hidden="true" />{{ qa.view_count }}</span>
        <span><Clock3 :size="14" aria-hidden="true" />{{ formatDate(qa.updated_at) }}</span>
      </div>
    </div>
  </article>
</template>
