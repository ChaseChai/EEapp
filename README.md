# ElderEscort (防诈守护)

面向老年人的反诈守护应用。通过系统音频捕获 + 离线语音识别 + NLP 欺诈检测，实时提醒老年人防范电信诈骗。

## 项目结构

```
EE/
├── EE_Android/     # Android 原生工程（WebView 容器 + 音频捕获 + Vosk 语音识别）
├── EE_Web/         # Vue 3 前端（适老化设计，超大字号/高对比度/简洁交互）
└── API.md          # 前后端接口协议
```

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | Vue 3 (Composition API) / Vite / Vue Router 4 / Axios |
| 移动端 | Kotlin / WebView / MediaProjection / Vosk |
| 协议 | RESTful JSON |

## 快速开始

### 前端开发

```bash
cd EE_Web
npm install
npm run dev
```

### Android 构建

用 Android Studio 打开 `EE_Android/` 目录，或：

```bash
cd EE_Android
./gradlew assembleDebug
```

## 接口协议

详见 [API.md](API.md)
