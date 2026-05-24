<div align="center">

# 🖋️ MathBlaster (数学爆破者) 
**—— 东方墨韵数学交互游戏 (Eastern Modernism Math Game)**

[![Play Now](https://img.shields.io/badge/%E7%82%B9%E5%87%BB%E6%B8%B8%E7%8E%A9-Play_Online-success?style=for-the-badge&logo=vercel)](https://ChaseChai.github.io/MathBlaster)
[![Framework](https://img.shields.io/badge/Next.js-App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Styling](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

*当硬核的高等数学邂逅“吴冠中式”的东方彩墨，抽象的函数便在宣纸上化作了灵动的水墨轨迹。*

</div>

---

## 🌟 游戏特色 (Features)

- **🔢 动态数学计算**：内置高性能数学解析引擎，完美支持二次项、三角函数、指数衰减等高级方程。
- **🎨 东方留白美学**：采用定制化“宣纸白”与“焦墨/淡墨”视觉系统，极简且极具张力。
- **⚛️ 硬核物理反馈**：60帧丝滑的物理发射弹道与墨汁粒子碰撞系统，感受击中目标的刹那快感。
- **🧠 开放式解法**：不设唯一标准答案！只要你的轨迹能穿透所有红点，任何奇思妙想的疯狂方程都能过关。

---

## 🎮 游玩方法 (How to Play)

### 1. 观察目标点与提示
进入每个关卡后，坐标系中会出现若干个**朱砂红色的目标点**。屏幕上方会提供该关卡的**通关提示 (Hint)**，暗示你需要构造哪种类型的数学函数（如直线、抛物线、正弦波澜等）。

### 2. 编写与自由调整公式
- **基础调整**：游戏下方提供了带变量的数学公式（例如 `a * x^2 + c`）与 `a`, `b`, `c` 三个参数滑块。您可以拖动滑块来实时改变函数曲线的形态（如振幅、开口大 小、相位、偏移量等）。
- **自由创作**：当然，您也完全可以根据自己的理解**重写或创作公式结构**进行发散式的思考，给出独特的答案（如自行添加 `sin()`, `exp()`, `abs()` 等函数），创造独属于您的解题路径！
- **动态预览**：在调整滑块时，宣纸画布上会实时显示一条**虚线轨迹**，代表当前公式的飞行路线。

### 3. 一键发射 (Launch)
当您认为虚线轨迹已经完美穿过所有目标点时，果断点击页面底部的 **"Launch (发射)"** 按钮，让墨滴顺着你构建的函数轨迹穿梭。若成功触发所有红点，即可通关并进入下个挑战！

---

## 🌌 关卡概览 (Level Guide)

游戏包含 9 个精心设计的关卡，从代数启蒙直到微积分的深渊：

1. **Origin (新手)**：一条简单的直线，感受 `y = a * x` 的斜率变化。
2. **Curve (中等)**：基础二次抛物线，像一个温柔的微笑。
3. **Gravity (中等)**：模拟真实的重力抛物线轨迹，向下坠落。
4. **Offset (困难)**：复杂几何位移体验，结合 `b` 和 `c` 掌控空间平移。
5. **Construction (困难)**：无尽的振荡波纹（需要驾驭 `sin` 正弦函数）。
6. **Resonance (进阶)**：抛物线与直线的干涉叠加态（共振）。
7. **Damping (进阶)**：指数衰减（`exp`），能量在原点聚集后如沉钝钟声般向外消散。
8. **Pulse / Agnesi (微积分)**：[阿涅西的女巫](https://zh.wikipedia.org/zh-cn/%E9%98%BF%E6%B6%85%E8%A5%BF%E7%9A%84%E5%A5%B3%E5%B7%AB)曲线，脉冲般瞬间爆发又迅速回归平静的理性之美。
9. **The Abyss / Sigmoid (微积分)**：从虚无到一切的平滑过渡（[逻辑斯蒂 S 型曲线](https://zh.wikipedia.org/zh-cn/%E9%80%BB%E8%BE%91%E6%96%AF%E8%B0%95%E5%87%BD%E6%95%B0)）。

---

## 🎨 视觉与色彩定义 (Color Palette)

此项目核心基于以下古典水墨调色板设定：
| 意象 | 颜色 (Hex) | 释义 |
| :--- | :--- | :--- |
| **宣纸白** | `#fbfbf9` | 核心负空间，模拟传统生宣温润质感。 |
| **焦墨** | `#1c1c1c` | 核心字形与骨架焦点，锐利、厚重。 |
| **淡墨** | `#5e5e5e` | 辅助引导线与坐标轴，退居次位。 |
| **朱砂红** | `#d44d4d` | 醒目、热烈，用于点缀目标点与强调重音。 |
| **石绿/青** | `#5a7d65` / `#4f8a8b` | 次要元素交互反馈。 |

---

## 💻 技术栈架构 (Tech Stack)

- **框架**: Next.js (App Router) + React
- **样式**: TailwindCSS (自定义配色体系)
- **渲染**: HTML5 Canvas + `requestAnimationFrame` (60fps 高性能物理碰撞与粒子系统)
- **数学引擎**: `math.js` (安全的动态表达式解析)
- **部署**: GitHub Pages

---

## 🚀 本地克隆开发 (Local Development)

如果您想在本地基于该代码库进行二次开发：

```bash
# 1. 克隆代码库
git clone https://github.com/ChaseChai/EEapp.git
cd EEapp/math-blaster-web

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:3000` 即可预览游戏。
