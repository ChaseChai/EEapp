import pygame
import sys
import math
import random
import re

# ========================
# 常量及全局配置
# ========================
WIDTH, HEIGHT = 1000, 700
FPS = 60

# 坐标系配置
SCALE = 40                    # 1 个数学单位 = 40 像素
ORIGIN_Y = HEIGHT // 2        # Y 轴原点 (屏幕居中)

# 东方现代主义 色彩调色板 (吴冠中水墨风格)
BG_COLOR = (245, 245, 240)    # 宣纸白
GRID_COLOR = (220, 220, 215)  # 极浅水墨灰
AXIS_COLOR = (150, 150, 145)  # 浓墨灰

# 彩色水墨特征色彩
INK_BLACK = (30, 30, 35)      # 焦墨
INK_RED = (200, 60, 60)       # 朱砂红
INK_GREEN = (60, 180, 100)    # 石绿
INK_BLUE = (70, 130, 180)     # 花青
INK_YELLOW = (220, 160, 50)   # 藤黄
TEXT_GRAY = (100, 100, 105)

# 游戏状态
STATE_MENU = 0
STATE_INPUT = 1
STATE_ANIMATING = 2
STATE_LEVEL_COMPLETE = 3
STATE_GAME_CLEAR = 4

# ========================
# 关卡设计 (拾卷 - 东方水墨诗意)
# ========================
LEVELS = [
    {
        "level": 1,
        "hint": "卷一：平步青云 (例如: y = 1.5x)",
        "func": "1.5*x",
        "target_x": [3, 6, 9]
    },
    {
        "level": 2,
        "hint": "卷二：落花有意 (例如: y = -0.2x^2 + 2x)",
        "func": "-0.2*x**2 + 2*x",
        "target_x": [4, 8, 12]
    },
    {
        "level": 3,
        "hint": "卷三：潮起潮落，连绵不绝的圆满之理。(例如: y = 3*sin(x))",
        "func": "3*sin(x)",
        "target_x": [1.57, 4.71, 7.85, 10.99] 
    },
    {
        "level": 4,
        "hint": "卷四：曲径通幽 (例如: y = cos(x) + 0.5x)",
        "func": "cos(x) + 0.5*x",
        "target_x": [3.14, 6.28, 9.42]
    },
    {
        "level": 5,
        "hint": "卷五：高处不胜寒 (例如: y = 0.1x^2 + sin(x))",
        "func": "0.1*x**2 + sin(x)",
        "target_x": [3, 6, 9, 12]
    },
    {
        "level": 6,
        "hint": "卷六：倒转乾坤 (例如: y = -x + 10)",
        "func": "-x + 10",
        "target_x": [2, 5, 8]
    },
    {
        "level": 7,
        "hint": "卷七：波澜不惊 (例如: y = 2*cos(x) - 1)",
        "func": "2*cos(x) - 1",
        "target_x": [0, 3.14, 6.28]
    },
    {
        "level": 8,
        "hint": "卷八：大漠孤烟直 (例如: y = 0.5x)",
        "func": "0.5*x",
        "target_x": [5, 10, 15]
    },
    {
        "level": 9,
        "hint": "卷九：明镜亦非台 [注意起始位置 x>0] (例如: y = 10/x)",
        "func": "10/x",
        "target_x": [1, 2, 5]
    },
    {
        "level": 10,
        "hint": "卷十：万法归一 (例如: y = sin(x)*x/2)",
        "func": "sin(x)*x/2",
        "target_x": [3.14, 6.28, 9.42, 12.56]
    }
]

# ========================
# 坐标映射及数学计算
# ========================
def math_to_screen(mx, my, cam_x):
    sx = int(100 + (mx - cam_x) * SCALE)
    sy = int(ORIGIN_Y - my * SCALE)
    return sx, sy

def parse_function(expr, x_val):
    expr = expr.replace("y", "").replace("=", "").replace(" ", "").strip()
    expr = expr.replace("^", "**")
    expr = re.sub(r'(\d)(x)', r'\g<1>*\g<2>', expr)
    expr = re.sub(r'(x)(\d)', r'\g<1>*\g<2>', expr)
    
    allowed_names = {'x': x_val}
    for func in ['sin', 'cos', 'tan', 'sqrt', 'pi', 'e']:
        allowed_names[func] = getattr(math, func)
        
    try:
        return eval(expr, {"__builtins__": {}}, allowed_names)
    except Exception:
        return None

def generate_targets_for_level(level_data):
    targets = []
    expr = level_data["func"]
    for tx in level_data["target_x"]:
        ty = parse_function(expr, tx)
        if ty is not None:
            targets.append({'x': tx, 'y': ty, 'hit': False, 'r': 18})
    return targets

# ========================
# 视觉特效：水墨粒子与涟漪
# ========================
class Particle:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.vx = random.uniform(-1, 1)
        self.vy = random.uniform(-1, 1)
        self.life = 255
        self.decay = random.uniform(3, 8)
        self.color = color
        self.radius = random.uniform(2, 6)

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.life -= self.decay

class Ripple:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.radius = 5
        self.life = 255
        self.color = color
        self.decay = 5
        self.growth = 2

    def update(self):
        self.radius += self.growth
        self.life -= self.decay

# ========================
# 核心游戏类
# ========================
class MathBlasterGame:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("MathBlaster - The Ten Scrolls")
        self.clock = pygame.time.Clock()
        
        try:
            self.font = pygame.font.SysFont('microsoftyahei', 24)
            self.title_font = pygame.font.SysFont('microsoftyahei', 36, bold=True)
            self.huge_font = pygame.font.SysFont('microsoftyahei', 64, bold=True)
        except:
            self.font = pygame.font.SysFont('simhei', 24)
            self.title_font = pygame.font.SysFont('simhei', 36, bold=True)
            self.huge_font = pygame.font.SysFont('simhei', 64, bold=True)
            
        self.current_level_idx = 0
        self.state = STATE_MENU
        self.particles = []
        self.ripples = []
        self.cam_x = 0

    def load_level(self):
        self.state = STATE_INPUT
        self.level_data = LEVELS[self.current_level_idx]
        self.input_expr = ""
        self.current_expr = "None"
        self.targets = generate_targets_for_level(self.level_data)
        self.total_targets = len(self.targets)
        self.score = 0
        
        self.starting_x = 0.1
        self.ball_x = self.starting_x
        self.ball_y = parse_function(self.level_data["func"], self.starting_x) or 0
        self.path_points = []
        self.is_invalid = False
        self.cam_x = 0
        self.particles.clear()
        self.ripples.clear()

    def spawn_ink(self, sx, sy, color, num=10):
        for _ in range(num):
            self.particles.append(Particle(sx, sy, color))

    def update_ball(self):
        step = 0.12
        self.ball_x += step
        
        if self.ball_x > 10:
            self.cam_x = self.ball_x - 10
            
        new_y = parse_function(self.current_expr, self.ball_x)
        if new_y is None or abs(new_y) > 100:
            self.check_level_end()
            return
            
        self.ball_y = new_y
        self.path_points.append({'mx': self.ball_x, 'my': self.ball_y})
        
        sx, sy = math_to_screen(self.ball_x, self.ball_y, self.cam_x)
        self.spawn_ink(sx, sy, INK_BLACK, 2)
        
        for t in self.targets:
            if not t['hit']:
                dist = math.hypot(self.ball_x - t['x'], self.ball_y - t['y'])
                if dist < 0.8:
                    t['hit'] = True
                    self.score += 1
                    tx, ty = math_to_screen(t['x'], t['y'], self.cam_x)
                    self.spawn_ink(tx, ty, INK_GREEN, 30)
                    self.ripples.append(Ripple(tx, ty, INK_GREEN))
            
        if self.ball_x > max([t['x'] for t in self.targets]) + 5:
            self.check_level_end()

    def check_level_end(self):
        if self.score >= self.total_targets:
            if self.current_level_idx < len(LEVELS) - 1:
                self.state = STATE_LEVEL_COMPLETE
            else:
                self.state = STATE_GAME_CLEAR
        else:
            self.state = STATE_INPUT
            self.ball_x = self.starting_x
            self.cam_x = 0
            self.path_points.clear()
            for t in self.targets:
                t['hit'] = False
            self.score = 0

    def draw_grid(self, screen):
        for i in range(-5, 50):
            sx, _ = math_to_screen(i, 0, self.cam_x)
            pygame.draw.line(screen, GRID_COLOR, (sx, 0), (sx, HEIGHT))
            
        for i in range(-20, 20):
            _, sy = math_to_screen(0, i, self.cam_x)
            pygame.draw.line(screen, GRID_COLOR, (0, sy), (WIDTH, sy))
            
        pygame.draw.line(screen, AXIS_COLOR, (0, ORIGIN_Y), (WIDTH, ORIGIN_Y), 2)
        sx0, _ = math_to_screen(0, 0, self.cam_x)
        pygame.draw.line(screen, AXIS_COLOR, (sx0, 0), (sx0, HEIGHT), 2)
        
        for i in range(0, 50, 5):
            if i == 0: continue
            sx, sy = math_to_screen(i, 0, self.cam_x)
            pygame.draw.line(screen, AXIS_COLOR, (sx, sy-5), (sx, sy+5), 2)

    def draw_effects(self):
        for p in self.particles[:]:
            p.update()
            if p.life <= 0:
                self.particles.remove(p)
            else:
                s = pygame.Surface((p.radius*2, p.radius*2), pygame.SRCALPHA)
                pygame.draw.circle(s, (*p.color, int(p.life)), (p.radius, p.radius), p.radius)
                self.screen.blit(s, (p.x - p.radius, p.y - p.radius))
                
        for r in self.ripples[:]:
            r.update()
            if r.life <= 0:
                self.ripples.remove(r)
            else:
                s = pygame.Surface((r.radius*2, r.radius*2), pygame.SRCALPHA)
                pygame.draw.circle(s, (*r.color, int(r.life)), (r.radius, r.radius), r.radius, 2)
                self.screen.blit(s, (r.x - r.radius, r.y - r.radius))

    def run(self):
        running = True
        while running:
            if self.state == STATE_ANIMATING:
                self.update_ball()

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                
                if event.type == pygame.KEYDOWN:
                    if self.state == STATE_MENU:
                        if event.key == pygame.K_RETURN:
                            self.current_level_idx = 0
                            self.load_level()
                            
                    elif self.state == STATE_GAME_CLEAR:
                        if event.key == pygame.K_r:
                            self.state = STATE_MENU
                            
                    elif self.state == STATE_LEVEL_COMPLETE:
                        if event.key == pygame.K_RETURN:
                            self.current_level_idx += 1
                            self.load_level()
                            
                    elif self.state == STATE_INPUT:
                        if event.key == pygame.K_RETURN:
                            if self.input_expr.strip() != "":
                                test_val = parse_function(self.input_expr, self.starting_x)
                                if test_val is not None:
                                    self.is_invalid = False
                                    self.current_expr = self.input_expr
                                    self.state = STATE_ANIMATING
                                    self.ball_y = test_val
                                    self.path_points.append({'mx': self.starting_x, 'my': self.ball_y})
                                else:
                                    self.is_invalid = True
                        elif event.key == pygame.K_BACKSPACE:
                            self.input_expr = self.input_expr[:-1]
                        else:
                            if event.unicode.isprintable() and len(event.unicode) > 0:
                                self.input_expr += event.unicode
                                
                    elif self.state == STATE_ANIMATING:
                        if event.key == pygame.K_r:
                            self.state = STATE_INPUT
                            self.ball_x = self.starting_x
                            self.cam_x = 0
                            self.path_points.clear()
                            for t in self.targets:
                                t['hit'] = False
                            self.score = 0

            # --- 渲染 ---
            self.screen.fill(BG_COLOR)
            
            if self.state == STATE_MENU:
                title = self.huge_font.render("MathBlaster", True, INK_BLACK)
                sub_title = self.title_font.render("东方水墨 - 十卷", True, INK_RED)
                start_hint = self.font.render("按 [ENTER] 执笔", True, TEXT_GRAY)
                self.screen.blit(title, (WIDTH//2 - title.get_width()//2, HEIGHT//3 - 50))
                self.screen.blit(sub_title, (WIDTH//2 - sub_title.get_width()//2, HEIGHT//3 + 40))
                self.screen.blit(start_hint, (WIDTH//2 - start_hint.get_width()//2, HEIGHT//3 + 150))
                
            else:
                self.draw_grid(self.screen)
                
                for t in self.targets:
                    color = INK_GREEN if t['hit'] else INK_RED
                    sx, sy = math_to_screen(t['x'], t['y'], self.cam_x)
                    pygame.draw.circle(self.screen, color, (sx, sy), t['r'])
                    
                    pygame.draw.circle(self.screen, BG_COLOR, (sx, sy), t['r'] - 4)
                    pygame.draw.circle(self.screen, color, (sx, sy), t['r'] - 10)

                if len(self.path_points) > 1:
                    screen_pts = [math_to_screen(p['mx'], p['my'], self.cam_x) for p in self.path_points]
                    pygame.draw.lines(self.screen, INK_BLUE, False, screen_pts, 4)
                    
                if self.state == STATE_ANIMATING:
                    bx, by = math_to_screen(self.ball_x, self.ball_y, self.cam_x)
                    pygame.draw.circle(self.screen, INK_BLACK, (bx, by), 6)
                    
                self.draw_effects()
                
                # UI 层
                pygame.draw.rect(self.screen, BG_COLOR, (0, 0, WIDTH, 80))
                pygame.draw.line(self.screen, GRID_COLOR, (0, 80), (WIDTH, 80), 2)
                
                level_text = self.title_font.render(f"卷 {self.current_level_idx + 1}", True, INK_BLACK)
                expr_text = self.title_font.render(f"笔迹: y = {self.current_expr}", True, INK_BLUE)
                score_text = self.title_font.render(f"点睛: {self.score} / {self.total_targets}", True, INK_YELLOW)
                self.screen.blit(level_text, (30, 25))
                self.screen.blit(expr_text, (200, 25))
                self.screen.blit(score_text, (WIDTH - score_text.get_width() - 30, 25))
                
                # 下方 UI
                pygame.draw.rect(self.screen, BG_COLOR, (0, HEIGHT - 90, WIDTH, 90))
                pygame.draw.line(self.screen, GRID_COLOR, (0, HEIGHT - 90), (WIDTH, HEIGHT - 90), 2)
                
                hint_text = self.font.render(self.level_data['hint'], True, INK_RED)
                self.screen.blit(hint_text, (30, HEIGHT - 80))
                
                if self.state == STATE_INPUT:
                    inp1 = self.font.render(f"落笔 y = {self.input_expr}_", True, INK_BLACK)
                    inp2 = self.font.render("按 ENTER 破纸", True, TEXT_GRAY)
                    self.screen.blit(inp1, (30, HEIGHT - 45))
                    self.screen.blit(inp2, (WIDTH - inp2.get_width() - 30, HEIGHT - 45))
                    if self.is_invalid:
                        err = self.font.render("笔锋不畅 (无效公式)", True, INK_RED)
                        self.screen.blit(err, (30, HEIGHT - 110))
                        
                elif self.state == STATE_ANIMATING:
                    anim_txt = self.font.render("行云流水...", True, TEXT_GRAY)
                    self.screen.blit(anim_txt, (30, HEIGHT - 45))
                    
                elif self.state == STATE_LEVEL_COMPLETE:
                    s = pygame.Surface((WIDTH, HEIGHT))
                    s.set_alpha(200)
                    s.fill(BG_COLOR)
                    self.screen.blit(s, (0,0))
                    
                    msg = self.huge_font.render("神来之笔！", True, INK_GREEN)
                    cont = self.font.render("按 [ENTER] 展下一卷", True, INK_BLACK)
                    self.screen.blit(msg, (WIDTH//2 - msg.get_width()//2, HEIGHT//2 - 60))
                    self.screen.blit(cont, (WIDTH//2 - cont.get_width()//2, HEIGHT//2 + 50))
                    
                elif self.state == STATE_GAME_CLEAR:
                    s = pygame.Surface((WIDTH, HEIGHT))
                    s.set_alpha(220)
                    s.fill(BG_COLOR)
                    self.screen.blit(s, (0,0))
                    
                    msg = self.huge_font.render("得道成仙！", True, INK_RED)
                    msg2 = self.title_font.render("十卷阅尽，数学奥义已然了然于胸。", True, INK_BLACK)
                    cont = self.font.render("按 [R] 归隐山林", True, TEXT_GRAY)
                    self.screen.blit(msg, (WIDTH//2 - msg.get_width()//2, HEIGHT//2 - 80))
                    self.screen.blit(msg2, (WIDTH//2 - msg2.get_width()//2, HEIGHT//2 + 20))
                    self.screen.blit(cont, (WIDTH//2 - cont.get_width()//2, HEIGHT//2 + 100))

            pygame.display.flip()
            self.clock.tick(FPS)
            
        pygame.quit()
        sys.exit()

if __name__ == '__main__':
    game = MathBlasterGame()
    game.run()