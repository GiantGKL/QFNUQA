export default defineNuxtConfig({
  compatibilityDate: '2026-09-02',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '曲园智答｜曲阜师范大学智能问答',
      meta: [
        { name: 'description', content: '面向曲阜师范大学学生的知识检索与智能问答平台' },
        { name: 'theme-color', content: '#123c69' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  runtimeConfig: {
    zhipuApiKey: '',
    zhipuApiUrl: '',
  },
  nitro: {
    compressPublicAssets: true,
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
