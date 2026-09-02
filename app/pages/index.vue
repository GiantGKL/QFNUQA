<script setup lang="ts">
import { CircleX, LoaderCircle, Search, Sparkles } from 'lucide-vue-next'
import type { AISearchResult, HotSearchResult, QA, QAListResult, QuickLinksResult } from '~/types'

const PAGE_SIZE = 9
const currentPage = ref(1)
const inputValue = ref('')
const searchKeyword = ref('')
const searchResult = ref<AISearchResult['data'] | null>(null)
const searchLoading = ref(false)
const searchError = ref('')
const selectedQAId = ref<number | null>(null)

const { data: listResult, status: listStatus, error: listError } = await useAsyncData(
  'qa-list',
  () => $fetch<QAListResult>('/api/qa', { query: { page: currentPage.value, pageSize: PAGE_SIZE, sortBy: 'view_count' } }),
  { watch: [currentPage] },
)

const { data: quickResult, status: quickStatus } = await useAsyncData(
  'quick-links',
  () => $fetch<QuickLinksResult>('/api/quick-links'),
)

const { data: hotResult } = await useAsyncData(
  'hot-searches',
  () => $fetch<HotSearchResult>('/api/search-logs/hot', { query: { limit: 6 } }),
)

const listItems = computed<QA[]>(() => listResult.value?.data?.items || [])
const totalItems = computed(() => listResult.value?.data?.pagination?.total || 0)
const totalPages = computed(() => Math.ceil(totalItems.value / PAGE_SIZE))
const quickLinks = computed(() => quickResult.value?.data || [])
const hotKeywords = computed(() => hotResult.value?.data || [])
const isSearchView = computed(() => searchLoading.value || Boolean(searchKeyword.value) || Boolean(searchResult.value))

async function runSearch(keyword = inputValue.value) {
  const normalized = keyword.trim()
  if (!normalized || searchLoading.value) return
  inputValue.value = normalized
  searchLoading.value = true
  searchError.value = ''
  searchResult.value = null
  try {
    const result = await $fetch<AISearchResult>('/api/ai/search', { query: { keyword: normalized } })
    searchKeyword.value = normalized
    searchResult.value = result.data
    void $fetch('/api/search-logs', {
      method: 'POST',
      body: { keyword: normalized, resultCount: result.data.items.length },
    }).catch(() => undefined)
  } catch {
    searchKeyword.value = normalized
    searchError.value = '搜索暂时不可用，请稍后再试。'
  } finally {
    searchLoading.value = false
  }
}

function clearSearch() {
  inputValue.value = ''
  searchKeyword.value = ''
  searchResult.value = null
  searchError.value = ''
}

function changePage(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 460, behavior: 'smooth' })
}
</script>

<template>
  <div class="shell">
    <AppHeader />
    <section class="hero">
      <div class="container hero-content">
        <p class="eyebrow">QFNU CAMPUS KNOWLEDGE</p>
        <h1>每一个校园问题，都有迹可循</h1>
        <p class="hero-copy">检索校内知识库，由曲小问结合可靠资料，为你的学习与校园生活提供清晰答案。</p>
        <form class="search-box" role="search" @submit.prevent="runSearch()">
          <Sparkles :size="21" aria-hidden="true" />
          <input v-model="inputValue" type="search" maxlength="200" autocomplete="off" aria-label="输入校园问题" placeholder="例如：如何查询成绩、图书馆几点闭馆……">
          <button v-if="inputValue" class="icon-button" type="button" aria-label="清空搜索" @click="clearSearch"><CircleX :size="19" /></button>
          <button class="icon-button search-submit" type="submit" :disabled="searchLoading || !inputValue.trim()" aria-label="开始搜索">
            <LoaderCircle v-if="searchLoading" class="spin" :size="21" />
            <Search v-else :size="21" />
          </button>
        </form>
        <div v-if="hotKeywords.length" class="hot-row">
          <span>本周热搜</span>
          <button v-for="item in hotKeywords" :key="item.keyword" class="hot-chip" type="button" @click="runSearch(item.keyword)">{{ item.keyword }}</button>
        </div>
      </div>
    </section>

    <main class="container main">
      <QuickLinks :links="quickLinks" :loading="quickStatus === 'pending'" />

      <section v-if="isSearchView" class="section" aria-live="polite">
        <div class="section-head">
          <div><p class="eyebrow">KNOWLEDGE SEARCH</p><h2 class="section-title">“{{ searchKeyword || inputValue }}” 的检索结果</h2></div>
          <span v-if="searchResult" class="section-count">知识库命中 {{ searchResult.items.length }} 条</span>
        </div>
        <div v-if="searchLoading" class="qa-grid"><div v-for="index in 6" :key="index" class="skeleton" /></div>
        <template v-else>
          <p v-if="searchError" class="notice">{{ searchError }}</p>
          <AiAnswer v-if="searchResult?.aiSummary" :content="searchResult.aiSummary" />
          <div v-if="searchResult?.items.length" class="qa-grid">
            <QaCard v-for="qa in searchResult.items" :key="qa.id" :qa="qa" @select="selectedQAId = $event" />
          </div>
          <div v-else-if="!searchError" class="empty">
            <Search :size="34" aria-hidden="true" /><h3>知识库中暂无相关条目</h3><p>你仍可参考上方智能回答，重要信息建议以学校官方渠道为准。</p>
          </div>
        </template>
      </section>

      <section v-else class="section" aria-labelledby="popular-title">
        <div class="section-head">
          <div><p class="eyebrow">POPULAR QUESTIONS</p><h2 id="popular-title" class="section-title">大家都在看</h2><p class="section-subtitle">从高频校园问题开始探索</p></div>
          <span v-if="totalItems" class="section-count">共 {{ totalItems }} 条知识</span>
        </div>
        <div v-if="listStatus === 'pending'" class="qa-grid"><div v-for="index in 9" :key="index" class="skeleton" /></div>
        <p v-else-if="listError" class="notice">问答列表加载失败，请刷新页面重试。</p>
        <template v-else>
          <div class="qa-grid"><QaCard v-for="qa in listItems" :key="qa.id" :qa="qa" @select="selectedQAId = $event" /></div>
          <PaginationControls :page="currentPage" :total-pages="totalPages" @change="changePage" />
        </template>
      </section>
    </main>

    <footer class="footer">
      <div class="container">知识内容参考 <a href="https://v1.wiki.easy-qfnu.top/" target="_blank" rel="noopener noreferrer">Easy-QFNU Wiki</a> · 重要信息请以学校官方通知为准</div>
    </footer>
    <QaDialog :open="selectedQAId !== null" :qa-id="selectedQAId" @close="selectedQAId = null" />
  </div>
</template>
