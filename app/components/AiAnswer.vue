<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { computed } from 'vue'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{ content: string }>()
const rendered = computed(() => renderMarkdown(props.content))
</script>

<template>
  <article class="answer-card" aria-labelledby="ai-answer-title">
    <div id="ai-answer-title" class="answer-label"><Sparkles :size="17" aria-hidden="true" />曲小问 · 智能回答</div>
    <div class="markdown" v-html="rendered" />
  </article>
</template>
