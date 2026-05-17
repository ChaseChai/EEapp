<template>
  <div class="home">
    <header class="home-header">
      <h1 class="home-title">防骗知识库</h1>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <span class="search-placeholder">搜索防骗知识...</span>
      </div>
    </header>

    <main class="home-main">
      <div
        v-for="item in articles"
        :key="item.id"
        class="article-card"
        @click="goArticle(item.id)"
      >
        <h2 class="card-title">{{ item.title }}</h2>
        <p class="card-summary">{{ item.summary }}</p>
        <span class="card-action">点击查看详情 →</span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../api/request.js'

const router = useRouter()
const articles = ref([])

onMounted(async () => {
  try {
    const res = await request.get('/api/v1/articles', { params: { page: 1, pageSize: 10 } })
    articles.value = res.data.data.list
  } catch (e) {
    console.error('获取文章列表失败', e)
  }
})

function goArticle(id) {
  router.push('/article/' + id)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f5f5;
  padding: 24px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 20px));
}

.home-header {
  margin-bottom: 40px;
}

.home-title {
  font-size: 36px;
  font-weight: 700;
  color: #d32f2f;
  text-align: center;
  margin-bottom: 24px;
  letter-spacing: 4px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border: 3px solid #bbb;
  border-radius: 14px;
  padding: 18px 20px;
  min-height: 56px;
  cursor: default;
}

.search-icon {
  font-size: 26px;
  margin-right: 14px;
}

.search-placeholder {
  font-size: 20px;
  color: #999;
}

.home-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  min-height: 56px;
}

.article-card:active {
  background: #f0f0f0;
}

.card-title {
  font-size: 26px;
  font-weight: 700;
  color: #212121;
  margin-bottom: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.card-summary {
  font-size: 20px;
  color: #555;
  line-height: 1.8;
  margin-bottom: 18px;
  word-break: break-word;
  overflow-wrap: break-word;
}

.card-action {
  font-size: 20px;
  color: #1976d2;
  font-weight: 600;
}
</style>
