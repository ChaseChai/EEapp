# ElderEscort

大健康防欺诈 Android 应用。拦截系统内部媒体音频 → 离线语音识别 → WebView 实时展示。

## 技术栈

- Kotlin + Android 10+ (API 29)
- AudioPlaybackCapture API（系统内录）
- Vosk 离线语音识别（小模型 42MB / 大模型 1.4GB）
- WebView + JSBridge 双向前端通信

## 快速开始

1. 下载 Vosk 中文模型放入 `app/src/main/assets/model/`
2. Android Studio 打开项目，Sync Gradle
3. 连接 Android 10+ 设备，Run

## 核心流程

```
MediaProjection 授权 → 前台服务保活 → AudioPlaybackCapture 内录
→ Vosk acceptWaveForm → 识别结果 JSON → TextDispatcher
→ MainActivity sendTextToWeb → WebView receiveAudioText
```
