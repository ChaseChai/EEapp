<template>
  <div class="article">
    <header class="article-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
    </header>

    <main class="article-body" v-if="article">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-content" v-html="renderedContent"></div>
    </main>

    <div class="article-empty" v-else>
      <p>文章加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../api/request.js'

const route = useRoute()
const router = useRouter()
const article = ref(null)

const renderedContent = computed(() => {
  if (!article.value) return ''
  return article.value.content.replace(/\n/g, '<br>')
})

onMounted(async () => {
  try {
    const res = await request.get('/api/v1/articles/' + route.params.id)
    article.value = res.data.data
  } catch (e) {
    console.error('获取文章详情失败', e)
  }
})

function goBack() {
  router.back()
}
</script>

<style scoped>
.article {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f5f5;
  padding: 24px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 20px));
}

.article-header {
  margin-bottom: 28px;
}

.back-btn {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  background: #d32f2f;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  cursor: pointer;
  min-height: 56px;
}

.back-btn:active {
  background: #b71c1c;
}

.article-body {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #212121;
  margin-bottom: 28px;
  line-height: 1.5;
  word-break: break-word;
}

.article-content {
  font-size: 22px;
  color: #333;
  line-height: 2;
  word-break: break-word;
  overflow-wrap: break-word;
}

.article-empty {
  text-align: center;
  font-size: 24px;
  color: #666;
  padding: 80px 0;
}
</style>
