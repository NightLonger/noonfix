class PixelCityBackground {
    constructor() {
        this.canvas = document.getElementById('cityBackground');
        this.ctx = this.canvas.getContext('2d');
        this.buildings = [];
        this.animatedWindows = [];

        // Определяем тип устройства
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Лимит FPS: 30 на мобильных, 60 на десктопе
        // На мобильных достаточно 30fps для фоновой анимации — вдвое меньше нагрузки на GPU
        this.fpsLimit    = this.isMobile ? 30 : 60;
        this.fpsInterval = 1000 / this.fpsLimit;
        this.lastFrameTime = 0;

        // Флаг паузы — ставится в true когда вкладка скрыта
        this.isPaused = false;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.generateBuildings();
        this.generateAnimatedWindows();
        this.animate();

        // Перегенерируем город при изменении размера окна
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.generateBuildings();
            this.generateAnimatedWindows();
        });

        // Пауза когда пользователь переключил вкладку или свернул браузер.
        // Без этого анимация гоняет GPU вхолостую и садит батарею на Android.
        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
        });
    }

    resizeCanvas() {
        // devicePixelRatio — соотношение физических пикселей экрана к CSS-пикселям.
        // На обычных экранах = 1. На Retina (iPhone, современные Android) = 2 или 3.
        // Без учёта dpr canvas выглядит размытым на таких экранах.
        // Ограничиваем до 2x — 3x не даёт заметной разницы, но втрое нагружает GPU.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const cssW = window.innerWidth;
        const cssH = window.innerHeight;

        // Физический размер canvas = CSS-размер × dpr
        this.canvas.width  = cssW * dpr;
        this.canvas.height = cssH * dpr;

        // CSS-размер оставляем прежним, чтобы canvas не занял весь экран физически
        this.canvas.style.width  = cssW + 'px';
        this.canvas.style.height = cssH + 'px';

        // ВАЖНО: canvas.width = ... выше уже сбросило все трансформации контекста,
        // поэтому ctx.scale() здесь применяется ровно один раз — накопления нет.
        // Масштабируем контекст — теперь все координаты пишем в CSS-пикселях как раньше,
        // а браузер сам переводит их в физические пиксели
        this.ctx.scale(dpr, dpr);

        // Сохраняем CSS-размеры для логики генерации зданий
        this.cssWidth  = cssW;
        this.cssHeight = cssH;
    }

    generateBuildings() {
        this.buildings = [];

        // Используем CSS-размеры (не canvas.width/height которые теперь умножены на dpr)
        const width  = this.cssWidth  || window.innerWidth;
        const height = this.cssHeight || window.innerHeight;

        const colors = ['#1A1A2E', '#16213E', '#0F3460', '#2D2D4E'];

        // Передний план — 4 крупных здания
        for (let i = 0; i < 4; i++) {
            const buildingWidth  = width * (0.15 + Math.random() * 0.1);
            const buildingHeight = height * (0.3  + Math.random() * 0.1);
            const x = i * width * 0.25 + Math.random() * 50 - 25;

            this.buildings.push({
                x, y: height - buildingHeight,
                width: buildingWidth,
                height: buildingHeight,
                color: colors[Math.floor(Math.random() * colors.length)],
                windows: this.generateWindows(buildingWidth, buildingHeight, 8),
                level: 'foreground'
            });
        }

        // Средний план — 6 зданий
        for (let i = 0; i < 6; i++) {
            const buildingWidth  = width * (0.08 + Math.random() * 0.06);
            const buildingHeight = height * (0.2  + Math.random() * 0.08);
            const x = Math.random() * width * 0.8 + width * 0.1;

            this.buildings.push({
                x, y: height - buildingHeight,
                width: buildingWidth,
                height: buildingHeight,
                color: colors[Math.floor(Math.random() * colors.length)],
                windows: this.generateWindows(buildingWidth, buildingHeight, 6),
                level: 'midground'
            });
        }

        // Задний план — 10 мелких зданий
        for (let i = 0; i < 10; i++) {
            const buildingWidth  = width * (0.04 + Math.random() * 0.04);
            const buildingHeight = height * (0.1  + Math.random() * 0.06);
            const x = Math.random() * width;

            this.buildings.push({
                x, y: height - buildingHeight,
                width: buildingWidth,
                height: buildingHeight,
                color: colors[Math.floor(Math.random() * colors.length)],
                windows: this.generateWindows(buildingWidth, buildingHeight, 3),
                level: 'background'
            });
        }
    }

    generateWindows(buildingWidth, buildingHeight, pixelSize) {
        const windows = [];
        const cols = Math.floor(buildingWidth  / (pixelSize * 4));
        const rows = Math.floor(buildingHeight / (pixelSize * 4));

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (Math.random() > 0.3) { // 70% окон светятся
                    windows.push({
                        x:    col * pixelSize * 4 + pixelSize,
                        y:    row * pixelSize * 4 + pixelSize,
                        size: pixelSize * 2,
                        color: '#2D2D4E' // тёмный по умолчанию
                    });
                }
            }
        }
        return windows;
    }

    generateAnimatedWindows() {
        this.animatedWindows = [];

        this.buildings.forEach((building, buildingIndex) => {
            // Процент мигающих окон зависит от плана — дальние мигают реже
            const pct = building.level === 'foreground' ? 0.07
                      : building.level === 'midground'  ? 0.04
                      : 0.015;

            building.windows.forEach((win, windowIndex) => {
                if (Math.random() >= pct) return;

                const colors = ['#FF00FF', '#00FFFF', '#FFFF00'];
                const color  = colors[Math.floor(Math.random() * colors.length)];

                // Тип и скорость анимации зависят от цвета
                let animationType, speed;
                if      (color === '#FF00FF') { animationType = 'pulse'; speed = 3000 + Math.random() * 2000; }
                else if (color === '#00FFFF') { animationType = 'blink'; speed = 1000 + Math.random() * 1000; }
                else                          { animationType = 'flash'; speed =  500 + Math.random() *  500; }

                this.animatedWindows.push({
                    buildingIndex,
                    windowIndex,
                    color,
                    animationType,
                    speed,
                    lastUpdate:   0,
                    currentState: 0,
                    flashResetAt: null  // для flash-эффекта вместо setTimeout
                });
            });
        });
    }

    draw() {
        const w = this.cssWidth  || window.innerWidth;
        const h = this.cssHeight || window.innerHeight;

        // clearRect вместо fillRect — не закрашиваем canvas чёрным,
        // а очищаем до прозрачности, чтобы был виден фон body
        this.ctx.clearRect(0, 0, w, h);

        this.buildings.forEach(building => {
            this.ctx.fillStyle = building.color;
            this.ctx.fillRect(building.x, building.y, building.width, building.height);

            building.windows.forEach(win => {
                this.ctx.fillStyle = win.color;
                this.ctx.fillRect(
                    building.x + win.x,
                    building.y + win.y,
                    win.size,
                    win.size
                );
            });
        });
    }

    updateAnimatedWindows(timestamp) {
        this.animatedWindows.forEach(animWindow => {
            const building = this.buildings[animWindow.buildingIndex];
            const win      = building.windows[animWindow.windowIndex];

            // Гасим flash-окно по timestamp (замена setTimeout).
            // setTimeout внутри requestAnimationFrame — антипаттерн:
            // он не синхронизирован с кадрами и накапливает очередь задач.
            if (animWindow.flashResetAt !== null && timestamp >= animWindow.flashResetAt) {
                win.color = '#2D2D4E';
                animWindow.flashResetAt = null;
            }

            if (timestamp - animWindow.lastUpdate <= animWindow.speed) return;
            animWindow.lastUpdate = timestamp;

            switch (animWindow.animationType) {
                case 'pulse':
                    animWindow.currentState = (animWindow.currentState + 1) % 3;
                    win.color = animWindow.currentState === 0 ? '#2D2D4E'
                              : animWindow.currentState === 1 ? animWindow.color
                              : this.adjustColorBrightness(animWindow.color, 0.7);
                    break;

                case 'blink':
                    win.color = (win.color === '#2D2D4E') ? animWindow.color : '#2D2D4E';
                    break;

                case 'flash':
                    // Включаем вспышку и записываем когда её гасить
                    win.color = animWindow.color;
                    animWindow.flashResetAt = timestamp + 100;
                    break;
            }
        });
    }

    adjustColorBrightness(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `#${Math.round(r * factor).toString(16).padStart(2, '0')}` +
               `${Math.round(g * factor).toString(16).padStart(2, '0')}` +
               `${Math.round(b * factor).toString(16).padStart(2, '0')}`;
    }

    animate(timestamp = 0) {
        // rAF ставим в самое начало — это гарантирует что следующий кадр
        // будет запрошен даже если мы выйдем досрочно из-за паузы или лимита FPS
        requestAnimationFrame((ts) => this.animate(ts));

        // Пауза: вкладка скрыта — рисовать незачем, GPU отдыхает
        if (this.isPaused) return;

        // Ограничение FPS.
        // elapsed % fpsInterval — корректировка накопленного смещения,
        // иначе при 30fps каждый чётный кадр будет чуть запаздывать.
        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = timestamp - (elapsed % this.fpsInterval);

        this.updateAnimatedWindows(timestamp);
        this.draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelCityBackground();
});
