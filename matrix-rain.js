class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrixRain');
        this.ctx    = this.canvas.getContext('2d');

        this.symbols    = 'TVFIX8BIT80SGLITCHPIXEL01';
        this.columns    = [];
        this.animationId = null;

        // Определяем тип устройства
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Лимит FPS: 24 на мобильных (плавно и экономно), 60 на десктопе
        this.fpsLimit    = this.isMobile ? 24 : 60;
        this.fpsInterval = 1000 / this.fpsLimit;
        this.lastFrameTime = 0;

        // Флаг паузы при скрытой вкладке
        this.isPaused = false;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createColumns();
        this.animate();

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createColumns();
        });

        // Пауза когда пользователь переключил вкладку или свернул браузер.
        // Без этого анимация продолжает жечь GPU и батарею в фоне.
        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
        });

        this.addInteractivity();
    }

    resizeCanvas() {
        // devicePixelRatio: на обычных экранах = 1, на Retina/Android HiDPI = 2 или 3.
        // Без учёта dpr символы выглядят размытыми — особенно заметно на Android.
        // Ограничиваем до 2x: 3x даёт почти незаметный прирост, но сильно грузит GPU.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const cssW = window.innerWidth;
        const cssH = window.innerHeight * 0.3; // дождь занимает верхние 30% экрана

        // Физический размер canvas = CSS-размер × dpr
        this.canvas.width  = cssW * dpr;
        this.canvas.height = cssH * dpr;

        // CSS-размер не меняем, чтобы canvas занимал ровно 30% высоты
        this.canvas.style.width  = cssW + 'px';
        this.canvas.style.height = cssH + 'px';

        // ВАЖНО: canvas.width = ... выше уже сбросило все трансформации контекста,
        // поэтому ctx.scale() здесь применяется ровно один раз — накопления нет.
        // Масштабируем контекст — все дальнейшие координаты пишем в CSS-пикселях
        this.ctx.scale(dpr, dpr);

        // Сохраняем CSS-размеры для логики колонок
        this.cssWidth  = cssW;
        this.cssHeight = cssH;

        // Шрифт нужно переустановить после scale — иначе сбрасывается
        this.ctx.font = 'bold 14px "Courier New", monospace';
    }

    createColumns() {
        this.columns = [];

        const columnWidth  = 20;
        const cssW = this.cssWidth || window.innerWidth;
        const columnsCount = Math.floor(cssW / columnWidth);

        for (let i = 0; i < columnsCount; i++) {
            this.columns.push({
                x:            i * columnWidth,
                y:            Math.random() * -100,       // стартуем выше экрана
                speed:        1 + Math.random() * 2,
                symbols:      this.generateSymbols(8 + Math.floor(Math.random() * 6)),
                currentSymbol: 0,
                isGlitching:  false,
                glitchTimer:  0
            });
        }
    }

    generateSymbols(length) {
        const result = [];
        for (let i = 0; i < length; i++) {
            result.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
        }
        return result;
    }

    draw() {
        const w = this.cssWidth  || window.innerWidth;
        const h = this.cssHeight || window.innerHeight * 0.3;

        // Полупрозрачный фон создаёт эффект постепенного исчезновения символов
        this.ctx.fillStyle = 'rgba(17, 17, 17, 0.1)';
        this.ctx.fillRect(0, 0, w, h);

        // Устанавливаем шрифт один раз на весь кадр — это быстрее чем
        // устанавливать его внутри drawSymbol() на каждый символ отдельно
        this.ctx.font = 'bold 14px "Courier New", monospace';

        this.columns.forEach(column => this.drawColumn(column));
    }

    drawColumn(column) {
        const symbolHeight = 12;
        const cssH = this.cssHeight || window.innerHeight * 0.3;

        for (let i = 0; i < column.symbols.length; i++) {
            const y = column.y + i * symbolHeight;

            // Пропускаем символы за пределами видимой области
            if (y < -symbolHeight || y > cssH) continue;

            const symbol  = column.symbols[i];
            const opacity = this.calculateOpacity(i, column.symbols.length);
            const color   = this.getSymbolColor(i, column);

            this.drawSymbol(symbol, column.x, y, color, opacity);
        }
    }

    drawSymbol(symbol, x, y, color, opacity) {
        // Добавляем альфа-канал к цвету для эффекта затухания.
        // Шрифт уже задан в draw() один раз — здесь не повторяем.
        this.ctx.fillStyle = color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        this.ctx.fillText(symbol, x, y);
    }

    calculateOpacity(symbolIndex, totalSymbols) {
        // Ведущий символ (верхний) — самый яркий
        if (symbolIndex === 0) return 1;
        // Хвост постепенно угасает
        return Math.max(0.2, 1 - (symbolIndex / totalSymbols) * 0.8);
    }

    getSymbolColor(symbolIndex, column) {
        if (column.isGlitching) {
            // Во время глитча — случайный неоновый цвет
            const glitchColors = ['#FF00FF', '#00FFFF', '#FFFF00'];
            return glitchColors[Math.floor(Math.random() * glitchColors.length)];
        }
        // Ведущий символ — голубой, хвост — розовый
        return symbolIndex === 0 ? '#00FFFF' : '#FF00FF';
    }

    update() {
        const cssH = this.cssHeight || window.innerHeight * 0.3;

        this.columns.forEach(column => {
            column.y += column.speed;

            column.currentSymbol = (column.currentSymbol + 1) % 4;

            // Случайный глитч — срабатывает с вероятностью 0.2% за кадр
            if (!column.isGlitching && Math.random() < 0.002) {
                column.isGlitching = true;
                column.glitchTimer = 10;
            }

            if (column.isGlitching) {
                column.glitchTimer--;
                if (column.glitchTimer <= 0) {
                    column.isGlitching = false;
                    column.symbols = this.generateSymbols(column.symbols.length);
                }
            }

            // Колонка ушла за нижний край — перезапускаем сверху
            if (column.y > cssH + column.symbols.length * 12) {
                this.resetColumn(column);
            }
        });
    }

    resetColumn(column) {
        column.y          = -Math.random() * 100;
        column.speed      = 1 + Math.random() * 2;
        column.symbols    = this.generateSymbols(8 + Math.floor(Math.random() * 6));
        column.isGlitching = false;
    }

    addInteractivity() {
        const logo = document.getElementById('mainLogo');
        const nav  = document.querySelector('.nav');

        // Ускорение символов при наведении на логотип
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                this.columns.forEach(col => { col.speed *= 2; });
            });
            logo.addEventListener('mouseleave', () => {
                this.columns.forEach(col => { col.speed /= 2; });
            });
        }

        // Случайный глитч при наведении на навигацию
        if (nav) {
            nav.addEventListener('mouseenter', () => {
                this.columns.forEach(col => {
                    if (Math.random() < 0.3) {
                        col.isGlitching = true;
                        col.glitchTimer = 20;
                    }
                });
            });
        }
    }

    animate(timestamp = 0) {
        // rAF ставим первым — гарантируем следующий кадр
        // даже если досрочно выходим из-за паузы или лимита FPS
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));

        // Пауза: вкладка не видна — рисовать не нужно
        if (this.isPaused) return;

        // Ограничение FPS.
        // elapsed % fpsInterval — убирает накопленное смещение времени,
        // иначе при 24fps часть кадров будет чуть запаздывать.
        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = timestamp - (elapsed % this.fpsInterval);

        this.update();
        this.draw();
    }

    // Полная остановка анимации (если понадобится вызвать извне)
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MatrixRain();
});
