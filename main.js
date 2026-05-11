// ========================
// 常量及全局配置
// ========================
const WIDTH = 1000;
const HEIGHT = 700;
const SCALE = 40;
const ORIGIN_Y = HEIGHT / 2;

// 颜色定义 (p5 格式)
let BG_COLOR, GRID_COLOR, AXIS_COLOR;
let INK_BLACK, INK_RED, INK_GREEN, INK_BLUE, INK_YELLOW, TEXT_GRAY;

// 游戏状态
const STATE_MENU = 0;
const STATE_INPUT = 1;
const STATE_ANIMATING = 2;
const STATE_LEVEL_COMPLETE = 3;
const STATE_GAME_CLEAR = 4;

let gameState = STATE_MENU;

// ========================
// 关卡设计
// ========================
const LEVELS = [
    { level: 1, hint: "卷一：平步青云 (例如: y = 1.5*x)", funcStr: "1.5*x", targetX: [3, 6, 9] },
    { level: 2, hint: "卷二：落花有意 (例如: y = -0.2*x*x + 2*x)", funcStr: "-0.2*x*x + 2*x", targetX: [4, 8, 12] },
    { level: 3, hint: "卷三：潮起潮落，连绵不绝的圆满之理。(例如: y = 3*sin(x))", funcStr: "3*sin(x)", targetX: [1.57, 4.71, 7.85, 10.99] },
    { level: 4, hint: "卷四：曲径通幽 (例如: y = cos(x) + 0.5*x)", funcStr: "cos(x) + 0.5*x", targetX: [3.14, 6.28, 9.42] },
    { level: 5, hint: "卷五：高处不胜寒 (例如: y = 0.1*x*x + sin(x))", funcStr: "0.1*x*x + sin(x)", targetX: [3, 6, 9, 12] },
    { level: 6, hint: "卷六：倒转乾坤 (例如: y = -x + 10)", funcStr: "-x + 10", targetX: [2, 5, 8] },
    { level: 7, hint: "卷七：波澜不惊 (例如: y = 2*cos(x) - 1)", funcStr: "2*cos(x) - 1", targetX: [0, 3.14, 6.28] },
    { level: 8, hint: "卷八：大漠孤烟直 (例如: y = 0.5*x)", funcStr: "0.5*x", targetX: [5, 10, 15] },
    { level: 9, hint: "卷九：明镜亦非台 [注意起始位置 x>0] (例如: y = 10/x)", funcStr: "10/x", targetX: [1, 2, 5] },
    { level: 10, hint: "卷十：万法归一 (例如: y = sin(x)*x/2)", funcStr: "sin(x)*x/2", targetX: [3.14, 6.28, 9.42, 12.56] }
];

// 游戏变量
let currentLevelIdx = 0;
let levelData;
let inputExpr = "";
let currentExpr = "None";
let targets = [];
let totalTargets = 0;
let score = 0;

let startingX = 0.1;
let ballX = startingX;
let ballY = 0;
let pathPoints = [];
let isInvalid = false;
let camX = 0;

let particles = [];
let ripples = [];

// ========================
// 初始化与设置
// ========================
function setup() {
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('game-container');
    
    // 初始化颜色
    BG_COLOR = color(245, 245, 240);
    GRID_COLOR = color(220, 220, 215);
    AXIS_COLOR = color(150, 150, 145);
    
    INK_BLACK = color(30, 30, 35);
    INK_RED = color(200, 60, 60);
    INK_GREEN = color(60, 180, 100);
    INK_BLUE = color(70, 130, 180);
    INK_YELLOW = color(220, 160, 50);
    TEXT_GRAY = color(100, 100, 105);
    
    textFont('Microsoft YaHei, SimHei, sans-serif');
}

// ========================
// 数学逻辑
// ========================
function mathToScreen(mx, my, cX) {
    let sx = 100 + (mx - cX) * SCALE;
    let sy = ORIGIN_Y - my * SCALE;
    return { sx, sy };
}

function parseFunction(expr, xVal) {
    // 简单的解析器，替换数学函数
    let safeExpr = expr.replace(/y/g, "").replace(/=/g, "").replace(/\s/g, "");
    
    // JS 中没有 ^ 符号，转换为 ** 或 Math.pow 需要复杂解析，
    // 这里简单处理：让用户直接输入 JS 支持的语法或做基础替换
    safeExpr = safeExpr.replace(/sin/g, 'Math.sin');
    safeExpr = safeExpr.replace(/cos/g, 'Math.cos');
    safeExpr = safeExpr.replace(/tan/g, 'Math.tan');
    safeExpr = safeExpr.replace(/sqrt/g, 'Math.sqrt');
    safeExpr = safeExpr.replace(/e/g, 'Math.E');
    safeExpr = safeExpr.replace(/pi/g, 'Math.PI');
    
    // 简易处理数字和x相乘: 2x -> 2*x
    safeExpr = safeExpr.replace(/(\d)(x)/g, '$1*$2');
    safeExpr = safeExpr.replace(/(x)(\d)/g, '$1*$2');

    try {
        // 使用构造函数执行安全一点，或者直接 eval
        let result = new Function('x', 'return ' + safeExpr)(xVal);
        if (isNaN(result) || !isFinite(result)) return null;
        return result;
    } catch (e) {
        return null;
    }
}

function generateTargets(levelD) {
    let tgs = [];
    for (let tx of levelD.targetX) {
        let ty = parseFunction(levelD.funcStr, tx);
        if (ty !== null) {
            tgs.push({ x: tx, y: ty, hit: false, r: 18 });
        }
    }
    return tgs;
}

function loadLevel() {
    gameState = STATE_INPUT;
    levelData = LEVELS[currentLevelIdx];
    inputExpr = "";
    currentExpr = "None";
    targets = generateTargets(levelData);
    totalTargets = targets.length;
    score = 0;
    
    startingX = 0.1;
    ballX = startingX;
    ballY = parseFunction(levelData.funcStr, startingX) || 0;
    pathPoints = [];
    isInvalid = false;
    camX = 0;
    particles = [];
    ripples = [];
}

// ========================
// 特效系统
// ========================
class Particle {
    constructor(x, y, col) {
        this.x = x;
        this.y = y;
        this.vx = random(-1, 1);
        this.vy = random(-1, 1);
        this.life = 255;
        this.decay = random(3, 8);
        this.color = color(col.toString()); // 复制颜色
        this.radius = random(2, 6);
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }
    
    display() {
        noStroke();
        this.color.setAlpha(this.life);
        fill(this.color);
        circle(this.x, this.y, this.radius * 2);
    }
}

class Ripple {
    constructor(x, y, col) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.life = 255;
        this.color = color(col.toString());
        this.decay = 5;
        this.growth = 2;
    }
    
    update() {
        this.radius += this.growth;
        this.life -= this.decay;
    }
    
    display() {
        noFill();
        this.color.setAlpha(this.life);
        stroke(this.color);
        strokeWeight(2);
        circle(this.x, this.y, this.radius * 2);
    }
}

function spawnInk(sx, sy, col, num = 10) {
    for (let i = 0; i < num; i++) {
        particles.push(new Particle(sx, sy, col));
    }
}

// ========================
// 主循环
// ========================
function draw() {
    // 逻辑更新
    if (gameState === STATE_ANIMATING) {
        updateBall();
    }
    
    // 绘制
    background(BG_COLOR);
    
    if (gameState === STATE_MENU) {
        drawMenu();
    } else {
        drawGrid();
        drawGameScene();
        drawEffects();
        drawUI();
    }
}

function drawMenu() {
    textAlign(CENTER, CENTER);
    fill(INK_BLACK);
    textSize(64);
    textStyle(BOLD);
    text("MathBlaster", WIDTH / 2, HEIGHT / 3 - 50);
    
    fill(INK_RED);
    textSize(36);
    text("东方水墨 - 十卷", WIDTH / 2, HEIGHT / 3 + 40);
    
    fill(TEXT_GRAY);
    textSize(24);
    textStyle(NORMAL);
    text("按 [ENTER] 执笔", WIDTH / 2, HEIGHT / 3 + 150);
}

function drawGrid() {
    stroke(GRID_COLOR);
    strokeWeight(1);
    
    for (let i = -5; i < 50; i++) {
        let pos = mathToScreen(i, 0, camX);
        line(pos.sx, 0, pos.sx, HEIGHT);
    }
    
    for (let i = -20; i < 20; i++) {
        let pos = mathToScreen(0, i, camX);
        line(0, pos.sy, WIDTH, pos.sy);
    }
    
    stroke(AXIS_COLOR);
    strokeWeight(2);
    line(0, ORIGIN_Y, WIDTH, ORIGIN_Y);
    let oPos = mathToScreen(0, 0, camX);
    line(oPos.sx, 0, oPos.sx, HEIGHT);
    
    for (let i = 0; i < 50; i += 5) {
        if (i === 0) continue;
        let p = mathToScreen(i, 0, camX);
        line(p.sx, p.sy - 5, p.sx, p.sy + 5);
    }
}

function drawGameScene() {
    // 目标
    for (let t of targets) {
        let col = t.hit ? INK_GREEN : INK_RED;
        let pos = mathToScreen(t.x, t.y, camX);
        
        noStroke();
        fill(col);
        circle(pos.sx, pos.sy, t.r * 2);
        
        fill(BG_COLOR);
        circle(pos.sx, pos.sy, (t.r - 4) * 2);
        
        fill(col);
        circle(pos.sx, pos.sy, (t.r - 10) * 2);
    }
    
    // 路径
    if (pathPoints.length > 1) {
        noFill();
        stroke(INK_BLUE);
        strokeWeight(4);
        beginShape();
        for (let p of pathPoints) {
            let sp = mathToScreen(p.mx, p.my, camX);
            vertex(sp.sx, sp.sy);
        }
        endShape();
    }
    
    // 球
    if (gameState === STATE_ANIMATING) {
        let bPos = mathToScreen(ballX, ballY, camX);
        fill(INK_BLACK);
        noStroke();
        circle(bPos.sx, bPos.sy, 12);
    }
}

function drawEffects() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        if (p.life <= 0) particles.splice(i, 1);
        else p.display();
    }
    
    for (let i = ripples.length - 1; i >= 0; i--) {
        let r = ripples[i];
        r.update();
        if (r.life <= 0) ripples.splice(i, 1);
        else r.display();
    }
}

function drawUI() {
    // 顶部 UI
    noStroke();
    fill(BG_COLOR);
    rect(0, 0, WIDTH, 80);
    stroke(GRID_COLOR);
    strokeWeight(2);
    line(0, 80, WIDTH, 80);
    
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(36);
    noStroke();
    
    fill(INK_BLACK);
    text(`卷 ${currentLevelIdx + 1}`, 30, 25);
    
    fill(INK_BLUE);
    text(`笔迹: y = ${currentExpr}`, 200, 25);
    
    textAlign(RIGHT, TOP);
    fill(INK_YELLOW);
    text(`点睛: ${score} / ${totalTargets}`, WIDTH - 30, 25);
    
    // 底部 UI
    noStroke();
    fill(BG_COLOR);
    rect(0, HEIGHT - 90, WIDTH, 90);
    stroke(GRID_COLOR);
    strokeWeight(2);
    line(0, HEIGHT - 90, WIDTH, HEIGHT - 90);
    
    textAlign(LEFT, TOP);
    textStyle(NORMAL);
    textSize(24);
    noStroke();
    
    fill(INK_RED);
    text(levelData.hint, 30, HEIGHT - 80);
    
    if (gameState === STATE_INPUT) {
        fill(INK_BLACK);
        text(`落笔 y = ${inputExpr}_`, 30, HEIGHT - 45);
        textAlign(RIGHT, TOP);
        fill(TEXT_GRAY);
        text("按 ENTER 破纸", WIDTH - 30, HEIGHT - 45);
        
        if (isInvalid) {
            textAlign(LEFT, TOP);
            fill(INK_RED);
            text("笔锋不畅 (无效公式)", 30, HEIGHT - 120);
        }
    } else if (gameState === STATE_ANIMATING) {
        fill(TEXT_GRAY);
        text("行云流水...", 30, HEIGHT - 45);
    } else if (gameState === STATE_LEVEL_COMPLETE) {
        fill(245, 245, 240, 200);
        rect(0, 0, WIDTH, HEIGHT);
        
        textAlign(CENTER, CENTER);
        fill(INK_GREEN);
        textSize(64);
        textStyle(BOLD);
        text("神来之笔！", WIDTH / 2, HEIGHT / 2 - 60);
        
        fill(INK_BLACK);
        textSize(24);
        textStyle(NORMAL);
        text("按 [ENTER] 展下一卷", WIDTH / 2, HEIGHT / 2 + 50);
    } else if (gameState === STATE_GAME_CLEAR) {
        fill(245, 245, 240, 220);
        rect(0, 0, WIDTH, HEIGHT);
        
        textAlign(CENTER, CENTER);
        fill(INK_RED);
        textSize(64);
        textStyle(BOLD);
        text("得道成仙！", WIDTH / 2, HEIGHT / 2 - 80);
        
        fill(INK_BLACK);
        textSize(36);
        text("十卷阅尽，数学奥义已然了然于胸。", WIDTH / 2, HEIGHT / 2 + 20);
        
        fill(TEXT_GRAY);
        textSize(24);
        textStyle(NORMAL);
        text("按 [R] 归隐山林", WIDTH / 2, HEIGHT / 2 + 100);
    }
}

// ========================
// 交互更新
// ========================
function updateBall() {
    let step = 0.12;
    ballX += step;
    
    if (ballX > 10) camX = ballX - 10;
    
    let newY = parseFunction(currentExpr, ballX);
    if (newY === null || abs(newY) > 100) {
        checkLevelEnd();
        return;
    }
    
    ballY = newY;
    pathPoints.push({ mx: ballX, my: ballY });
    
    let bPos = mathToScreen(ballX, ballY, camX);
    spawnInk(bPos.sx, bPos.sy, INK_BLACK, 2);
    
    for (let t of targets) {
        if (!t.hit) {
            let distToTarget = dist(ballX, ballY, t.x, t.y);
            if (distToTarget < 0.8) {
                t.hit = true;
                score++;
                let tPos = mathToScreen(t.x, t.y, camX);
                spawnInk(tPos.sx, tPos.sy, INK_GREEN, 30);
                ripples.push(new Ripple(tPos.sx, tPos.sy, INK_GREEN));
            }
        }
    }
    
    let maxTargetX = Math.max(...targets.map(t => t.x));
    if (ballX > maxTargetX + 5) {
        checkLevelEnd();
    }
}

function checkLevelEnd() {
    if (score >= totalTargets) {
        if (currentLevelIdx < LEVELS.length - 1) {
            gameState = STATE_LEVEL_COMPLETE;
        } else {
            gameState = STATE_GAME_CLEAR;
        }
    } else {
        resetAttempt();
    }
}

function resetAttempt() {
    gameState = STATE_INPUT;
    ballX = startingX;
    camX = 0;
    pathPoints = [];
    for (let t of targets) t.hit = false;
    score = 0;
}

// ========================
// 输入处理
// ========================
function keyPressed() {
    if (gameState === STATE_MENU) {
        if (keyCode === ENTER) {
            currentLevelIdx = 0;
            loadLevel();
        }
    } else if (gameState === STATE_GAME_CLEAR) {
        if (key === 'r' || key === 'R') {
            gameState = STATE_MENU;
        }
    } else if (gameState === STATE_LEVEL_COMPLETE) {
        if (keyCode === ENTER) {
            currentLevelIdx++;
            loadLevel();
        }
    } else if (gameState === STATE_INPUT) {
        if (keyCode === ENTER) {
            if (inputExpr.trim() !== "") {
                let testVal = parseFunction(inputExpr, startingX);
                if (testVal !== null) {
                    isInvalid = false;
                    currentExpr = inputExpr;
                    gameState = STATE_ANIMATING;
                    ballY = testVal;
                    pathPoints.push({ mx: startingX, my: ballY });
                } else {
                    isInvalid = true;
                }
            }
        } else if (keyCode === BACKSPACE) {
            inputExpr = inputExpr.slice(0, -1);
        } else if (key.length === 1) {
            // p5 的 key 包含输入的字符
            inputExpr += key;
        }
    } else if (gameState === STATE_ANIMATING) {
        if (key === 'r' || key === 'R') {
            resetAttempt();
        }
    }
}