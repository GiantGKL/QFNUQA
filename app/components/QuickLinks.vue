<script setup lang="ts">
import { CalendarDays, ExternalLink, GraduationCap, Library, Link, Map } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { QuickLink } from '~/types'

const props = defineProps<{ links: QuickLink[]; loading?: boolean }>()

const iconMap: Record<string, Component> = {
  map: Map,
  calendar: CalendarDays,
  school: GraduationCap,
  library: Library,
  link: Link,
}

const getIcon = (name: string | null) => iconMap[name || ''] || ExternalLink
</script>

<template>
  <section v-if="props.loading || props.links.length" class="section" aria-labelledby="quick-links-title">
    <div class="section-head">
      <div><h2 id="quick-links-title" class="section-title">校园快捷入口</h2><p class="section-subtitle">常用服务，一步直达</p></div>
    </div>
    <div class="quick-grid">
      <div v-for="index in props.loading ? 6 : 0" :key="`quick-skeleton-${index}`" class="skeleton" style="min-height: 116px" />
      <a v-for="linkItem in props.links" :key="linkItem.id" class="quick-link" :href="linkItem.url" target="_blank" rel="noopener noreferrer">
        <span class="quick-icon"><component :is="getIcon(linkItem.icon)" :size="21" aria-hidden="true" /></span>
        <span>{{ linkItem.name }}</span>
      </a>
    </div>
  </section>
</template>
