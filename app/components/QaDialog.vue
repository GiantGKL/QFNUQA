<script setup lang="ts">
import { Clock3, Eye, LoaderCircle, X } from 'lucide-vue-next'
import { onBeforeUnmount, watch } from 'vue'
import type { ApiResult, QA } from '~/types'

const props = defineProps<{ open: boolean; qaId: number | null }>()
const emit = defineEmits<{ close: [] }>()
const qa = ref<QA | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const close = () => emit('close')
const formatDate = (value: string) => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) close()
}

watch(() => [props.open, props.qaId] as const, async ([open, id]) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
  if (!open || !id) {
    qa.value = null
    errorMessage.value = ''
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await $fetch<ApiResult<QA>>(`/api/qa/${id}`)
    qa.value = result.data
  } catch {
    qa.value = null
    errorMessage.value = '问答详情加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}, { immediate: true })

if (import.meta.client) window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="dialog-backdrop" @mousedown.self="close">
        <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="qa-dialog-title">
          <div v-if="loading" class="dialog-loading"><LoaderCircle class="spin" :size="32" aria-label="正在加载" /></div>
          <template v-else-if="qa">
            <header class="dialog-head">
              <div>
                <span v-if="qa.category_name" class="category">{{ qa.category_name }}</span>
                <h2 id="qa-dialog-title">{{ qa.question }}</h2>
              </div>
              <button class="icon-button" type="button" aria-label="关闭问答详情" @click="close"><X :size="21" /></button>
            </header>
            <div class="dialog-body">
              <div v-if="qa.tags.length" class="tag-row"><span v-for="tag in qa.tags" :key="tag.id" class="chip">{{ tag.name }}</span></div>
              <p class="dialog-answer">{{ qa.answer }}</p>
              <div class="dialog-meta">
                <span><Eye :size="15" aria-hidden="true" /> {{ qa.view_count }} 次浏览</span>
                <span><Clock3 :size="15" aria-hidden="true" /> 更新于 {{ formatDate(qa.updated_at) }}</span>
              </div>
            </div>
          </template>
          <div v-else class="dialog-body"><p class="notice">{{ errorMessage }}</p></div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
