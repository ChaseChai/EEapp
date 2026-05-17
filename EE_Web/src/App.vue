<template>
  <router-view />
  <GlobalAlert
    :isVisible="isVisible"
    :warningMsg="currentWarning"
    :articleId="currentArticleId"
    @close="closeAlert"
    @view-truth="viewTruth"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from './api/request.js'
import GlobalAlert from './components/GlobalAlert.vue'

const router = useRouter()

const isVisible = ref(false)
const currentWarning = ref('')
const currentArticleId = ref(0)

function closeAlert() {
  isVisible.value = false
}

function viewTruth() {
  isVisible.value = false
  if (currentArticleId.value) {
    router.push('/article/' + currentArticleId.value)
  }
}

window.receiveAudioText = async function (text) {
  try {
    const res = await request.post('/api/v1/analysis', { text })
    const data = res.data.data
    if (data.isFraud) {
      currentWarning.value = data.warningMessage
      currentArticleId.value = data.targetArticleId
      isVisible.value = true
    }
  } catch (e) {
    console.error('分析请求失败', e)
  }
}
</script>
