// Конфигурация и константы
const CONFIG = {
    glitch: {
        interval: 3000,
        probability: 0.7,
        duration: 100
    },
    stages: {
        autoSwitchInterval: 3000,
        animationDuration: 500
    },
    mobileBreakpoint: 768,
    modal: {
        closeDelay: 2000,
        animationDuration: 1000
    }
};

// Конфигурация Telegram
const TELEGRAM_CONFIG = {
    botToken: '8410028742:AAGjEgJSRDyJxYUbOhbtCyOmqY0xP3D8VzM',
    adminChatId: '546467695',
    
    // Мастера - получают ТОЛЬКО свои заявки
    masters: {
        'nnov': '546467695',      // Нижний Новгород
        'perm': '490135281',      // Пермь
        'syktyvkar': '6744326620' // Сыктывкар
    }
};

// Конфигурация города
const cityConfig = {
    name: 'Пермь',
    code: 'perm' // ← Важно для определения кому слать
};

// Кэш DOM элементов
const domCache = {
    elements: {},
    get(selector) {
        if (!this.elements[selector]) {
            this.elements[selector] = document.querySelector(selector);
        }
        return this.elements[selector];
    },
    getAll(selector) {
        if (!this.elements[selector]) {
            this.elements[selector] = document.querySelectorAll(selector);
        }
        return this.elements[selector];
    },
    // Очистка кэша при необходимости
    clear() {
        this.elements = {};
    }
};

// Утилиты
const utils = {
    // Дебаунс для оптимизации событий
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Плавный скролл к элементу
    smoothScrollTo(element, block = 'start') {
        if (element && element.scrollIntoView) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: block
            });
        }
    },

    // Анимация элемента
    animateElement(element, animationClass, duration = 300) {
        if (!element) return;
        
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    },

    // Управление скроллом body
    toggleBodyScroll(enable) {
        document.body.style.overflow = enable ? '' : 'hidden';
    },

    // Маска для телефона
    formatPhoneInput(value) {
        let numbers = value.replace(/\D/g, '');
        
        if (numbers.startsWith('7') || numbers.startsWith('8')) {
            numbers = numbers.substring(1);
        }
        
        if (numbers.length === 0) return '';
        
        let formatted = '+7 (';
        
        if (numbers.length > 0) {
            formatted += numbers.substring(0, 3);
        }
        if (numbers.length > 3) {
            formatted += ') ' + numbers.substring(3, 6);
        }
        if (numbers.length > 6) {
            formatted += '-' + numbers.substring(6, 8);
        }
        if (numbers.length > 8) {
            formatted += '-' + numbers.substring(8, 10);
        }
        
        return formatted;
    },

    // Проверка поддержки touch событий
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

// Функция отправки в Telegram
async function sendToTelegram(cityCode, formData) {
    const message = `
🚗 НОВАЯ ЗАЯВКА
──────────────
🏙️ Город: ${formData.city.name}
👤 Имя: ${formData.name}
📞 Телефон: ${formData.phone}
🔧 Проблема: ${formData.problem}
🕐 Время: ${new Date().toLocaleString('ru-RU')}
🌐 Сайт: ${window.location.hostname}
    `;

    try {
        // 1. Отправляем ВАМ (все заявки)
        await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.adminChatId,
                text: `👑 ${message}` // 👑 - метка для админа
            })
        });

        // 2. Отправляем МАСТЕРУ (только его город)
        if (TELEGRAM_CONFIG.masters[cityCode]) {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: TELEGRAM_CONFIG.masters[cityCode],
                    text: message
                })
            });
        }

        console.log('✅ Заявки отправлены!');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка отправки:', error);
        return false;
    }
}

// Обработка загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeLogo();
    initializeNavigation();
    initializeCallbacks();
    initializeMobileMenu();
    initializePricing();
    initializeWhyMe();
    initializeMaskVideo();
    initializeFloatingContact();
    initializeWorkStages();
    initializeMasterModal();
    
    optimizeForMobile();
    window.addEventListener('resize', utils.debounce(optimizeForMobile, 250));
    
    console.log('🚀 Все модули инициализированы');
});

// Инициализация логотипа
function initializeLogo() {
    const logo = domCache.get('#mainLogo');
    if (!logo) return;

    const randomDelay = Math.random() * 1000;
    
    setTimeout(() => {
        logo.classList.replace('logo-loading', 'logo-loaded');
        startAdvancedGlitchEffects();
        addLogoInteractions();
    }, randomDelay);
}

function startAdvancedGlitchEffects() {
    const glitchTexts = domCache.getAll('.logo-text-glitch');
    const logo = domCache.get('#mainLogo');
    if (!logo) return;

    const glitchInterval = setInterval(() => {
        if (Math.random() > CONFIG.glitch.probability) {
            // Применяем глитч
            logo.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 4 - 2}px)`;
            
            glitchTexts.forEach(text => {
                text.style.color = Math.random() > 0.5 ? 'var(--neon-pink)' : 'var(--neon-cyan)';
            });
            
            // Возвращаем нормальное состояние
            setTimeout(() => {
                logo.style.transform = '';
                glitchTexts.forEach(text => {
                    text.style.color = '';
                });
            }, CONFIG.glitch.duration);
        }
    }, CONFIG.glitch.interval);

    // Очистка интервала при выгрузке страницы
    window.addEventListener('beforeunload', () => {
        clearInterval(glitchInterval);
    });
}

function addLogoInteractions() {
    const logo = domCache.get('#mainLogo');
    if (!logo) return;

    const interactions = {
        mouseenter: () => {
            logo.style.boxShadow = '0 0 30px var(--neon-pink), 0 0 60px var(--neon-cyan)';
            logo.style.transform = 'scale(1.05)';
        },
        mouseleave: () => {
            logo.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.1)';
            logo.style.transform = '';
        },
        click: () => {
            utils.animateElement(logo, 'glitch-overlay', 300);
            trackUserInteraction('logo_clicked');
        }
    };

    Object.entries(interactions).forEach(([event, handler]) => {
        logo.addEventListener(event, handler);
    });
}

// Инициализация навигации
function initializeNavigation() {
    const navLinks = domCache.getAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = domCache.get(targetId);
            
            if (targetSection) {
                utils.smoothScrollTo(targetSection);
                trackUserInteraction('navigation_click', { target: targetId });
            }
        });
    });
}

// Инициализация обратных вызовов (теперь используется модальное окно)
function initializeCallbacks() {
    const callbackBtn = domCache.get('.callback-btn');
    
    if (callbackBtn) {
        callbackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            trackUserInteraction('callback_button_clicked');
        });
    }
}

// Оптимизация для мобильных устройств
function optimizeForMobile() {
    const isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;
    document.body.classList.toggle('mobile-view', isMobile);
    
    // Дополнительные мобильные оптимизации
    if (isMobile) {
        document.body.classList.add('touch-device');
    } else {
        document.body.classList.remove('touch-device');
    }
}

// Инициализация мобильного меню
function initializeMobileMenu() {
    const mobileMenuBtn = domCache.get('.mobile-menu-btn');
    const mobileMenu = domCache.get('.mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenu.classList.toggle('active');
            utils.toggleBodyScroll(!isActive);
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
            
            trackUserInteraction('mobile_menu_toggled', { state: isActive ? 'opened' : 'closed' });
        });

        // Закрытие меню при клике на ссылку
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                utils.toggleBodyScroll(true);
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

// Инициализация цен
function initializePricing() {
    const tableRows = domCache.getAll('.table-row[data-service]');
    
    tableRows.forEach(row => {
        row.addEventListener('click', () => {
            const service = row.getAttribute('data-service');
            const targetSection = domCache.get('#services');
            
            utils.smoothScrollTo(targetSection);
            
            setTimeout(() => {
                highlightServiceCard(service);
            }, 500);
            
            trackUserInteraction('pricing_row_clicked', { service: service });
        });
        
        // Добавляем интерактивность
        row.style.cursor = 'pointer';
        row.classList.add('interactive-row');
    });
}

function highlightServiceCard(service) {
    const allCards = domCache.getAll('.service-card');
    const targetCard = domCache.get(`.service-card:nth-child(${getCardIndex(service)})`);
    
    // Снимаем подсветку
    allCards.forEach(card => {
        card.style.boxShadow = '';
    });
    
    // Подсвечиваем целевую карточку
    if (targetCard) {
        targetCard.style.boxShadow = '0 0 30px var(--neon-pink)';
        setTimeout(() => {
            targetCard.style.boxShadow = '';
        }, 2000);
    }
}

function getCardIndex(service) {
    const serviceMap = {
        'matrix': 1,
        'backlight': 2,
        'power': 3,
        'firmware': 4,
        'motherboard': 5,
        'buyout': 6
    };
    return serviceMap[service] || 1;
}

// Инициализация секции "Почему я"
function initializeWhyMe() {
    const advantageItems = domCache.getAll('.advantage-item');
    const menuOption = domCache.get('.menu-option');
    
    advantageItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            item.style.animation = 'item-pulse 0.5s ease-in-out';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.animation = '';
        });
        
        item.addEventListener('click', () => {
            trackUserInteraction('advantage_clicked', { index: index + 1 });
        });
    });
    
    if (menuOption) {
        menuOption.addEventListener('click', () => {
            const nextSection = domCache.get('#contacts');
            utils.smoothScrollTo(nextSection);
            trackUserInteraction('continue_menu_clicked');
        });
        
        menuOption.style.cursor = 'pointer';
        menuOption.classList.add('interactive-element');
    }
}

// Инициализация видео
function initializeMaskVideo() {
    const video = domCache.get('#masksVideo');
    const container = domCache.get('.mask-video-container');
    
    if (!video || !container) return;
    
    // Настройка видео
    Object.assign(video, {
        loop: true,
        muted: true,
        playsInline: true,
        preload: 'auto'
    });
    
    // Обработчики событий
    container.addEventListener('click', () => {
        video.currentTime = 0;
        video.play().catch(console.error);
        trackUserInteraction('video_restarted');
    });
    
    video.addEventListener('loadeddata', () => {
        video.play().catch(e => {
            console.log('Автовоспроизведение заблокировано, ждем взаимодействия пользователя');
        });
    });
    
    video.addEventListener('error', () => {
        console.error('Ошибка загрузки видео');
        video.style.display = 'none';
        trackUserInteraction('video_load_error');
    });
    
    // Отслеживание начала воспроизведения
    video.addEventListener('play', () => {
        trackUserInteraction('video_play_started');
    });
}

// Функция для плавающей кнопки связи
function initializeFloatingContact() {
    const floatingContact = domCache.get('#floatingContact');
    if (!floatingContact) return;

    const contactButton = floatingContact.querySelector('.contact-button-main');
    if (!contactButton) return;

    const toggleMenu = (e) => {
        e?.stopPropagation();
        const isActive = floatingContact.classList.toggle('active');
        trackUserInteraction('floating_contact_toggled', { state: isActive ? 'opened' : 'closed' });
    };

    const closeMenu = () => {
        floatingContact.classList.remove('active');
    };

    contactButton.addEventListener('click', toggleMenu);
    document.addEventListener('click', closeMenu);
    
    // Закрытие при клике на пункты меню
    const menuItems = floatingContact.querySelectorAll('.contact-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            closeMenu();
            trackUserInteraction('contact_menu_item_clicked', { 
                type: item.textContent.trim() 
            });
        });
    });
    
    // Закрытие при скролле с дебаунсом
    window.addEventListener('scroll', utils.debounce(closeMenu, 100));
}

// Инициализация этапов работ
function initializeWorkStages() {
    const stages = domCache.getAll('.stage');
    const progressFill = domCache.get('.progress-fill');
    const descriptionText = domCache.get('.description-text');
    
    if (!stages.length || !progressFill || !descriptionText) return;

    const stageData = {
        1: "Удобным для Вас способом",
        2: "В удобное для Вас время", 
        3: "Выявление неисправности и согласование стоимости",
        4: "Ремонт и проверка качества проведенных работ",
        5: "В удобную для Вас дату и время"
    };
    
    let currentStage = 1;
    let autoSwitchInterval;

    function switchStage(stageNumber) {
        // Обновляем активный этап
        stages.forEach(stage => stage.classList.remove('active'));
        const targetStage = domCache.get(`[data-stage="${stageNumber}"]`);
        if (targetStage) targetStage.classList.add('active');
        
        // Обновляем прогресс-бар
        const progressPercent = ((stageNumber - 1) / 4) * 100;
        progressFill.style.width = `${progressPercent}%`;
        
        // Обновляем описание с анимацией
        if (stageData[stageNumber]) {
            utils.animateElement(descriptionText, 'text-fade', 500);
            descriptionText.textContent = stageData[stageNumber];
        }
        
        currentStage = stageNumber;
        trackUserInteraction('stage_changed', { stage: stageNumber });
    }
    
    function startAutoSwitch() {
        autoSwitchInterval = setInterval(() => {
            const nextStage = currentStage === 5 ? 1 : currentStage + 1;
            switchStage(nextStage);
        }, CONFIG.stages.autoSwitchInterval);
    }
    
    function stopAutoSwitch() {
        if (autoSwitchInterval) {
            clearInterval(autoSwitchInterval);
        }
    }
    
    // Обработчики для этапов
    stages.forEach(stage => {
        stage.addEventListener('click', () => {
            const stageNumber = parseInt(stage.getAttribute('data-stage'));
            stopAutoSwitch();
            switchStage(stageNumber);
            startAutoSwitch();
            
            trackUserInteraction('stage_manual_click', { stage: stageNumber });
        });
        
        // Добавляем доступность
        stage.setAttribute('role', 'button');
        stage.setAttribute('tabindex', '0');
        
        // Обработка клавиатуры
        stage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                stage.click();
            }
        });
    });
    
    // Запускаем автоматическое переключение
    startAutoSwitch();
    
    // Очистка при выгрузке страницы
    window.addEventListener('beforeunload', stopAutoSwitch);
}

// Инициализация модального окна вызова мастера
function initializeMasterModal() {
    const modal = document.getElementById('masterModal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }

    const openButtons = document.querySelectorAll('.callback-btn');
    const closeButton = modal.querySelector('.modal-close');
    const form = document.getElementById('masterForm');
    const overlay = modal.querySelector('.modal-overlay');
    const agreementCheckbox = document.getElementById('userAgreement');
    const submitBtn = document.getElementById('submitBtn');

    if (!closeButton || !form || !overlay || !agreementCheckbox || !submitBtn) {
        console.error('Some modal elements not found');
        return;
    }

    // Устанавливаем город в форме
    const cityDisplay = document.getElementById('cityDisplay');
    if (cityDisplay) {
        cityDisplay.textContent = cityConfig.name;
    }

    // Открытие модального окна
    function openModal() {
        setTimeout(() => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Сброс формы
            form.reset();
            updateSubmitButton();
            
            // Фокус на первое поле
            setTimeout(() => {
                const userNameInput = document.getElementById('userName');
                if (userNameInput) userNameInput.focus();
            }, 100);
        }, 10);
    }

    // Закрытие модального окна
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Обновление состояния кнопки отправки
    function updateSubmitButton() {
        const isFormValid = form.checkValidity() && agreementCheckbox.checked;
        submitBtn.disabled = !isFormValid;
    }

    // Обработчики открытия
    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal();
        });
    });

    // Обработчики закрытия
    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Валидация формы в реальном времени
    form.addEventListener('input', updateSubmitButton);
    agreementCheckbox.addEventListener('change', updateSubmitButton);

    // Обработка отправки формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!form.checkValidity() || !agreementCheckbox.checked) {
            // Анимация ошибки
            form.classList.add('form-error');
            setTimeout(() => form.classList.remove('form-error'), 1000);
            return;
        }

        // Собираем данные формы
        const formData = {
            city: cityConfig,
            name: document.getElementById('userName').value,
            phone: document.getElementById('userPhone').value,
            problem: document.getElementById('userProblem').value,
            timestamp: new Date().toLocaleString('ru-RU')
        };

        console.log('📦 Данные заявки:', formData);
        
        // Отправляем в Telegram
        const success = await sendToTelegram(cityConfig.code, formData);
        
        if (success) {
            // Показываем успешную отправку
            showSuccessMessage();
            
            // Закрываем модалку через 2 секунды
            setTimeout(() => {
                closeModal();
            }, 2000);
        } else {
            // Показываем ошибку
            alert('Ошибка отправки заявки. Пожалуйста, попробуйте позже.');
        }
    });

    // Функция успешной отправки
    function showSuccessMessage() {
        closeModal();
        
        // Показываем окно благодарности через небольшую задержку
        setTimeout(() => {
            openSuccessModal();
        }, 500);
    }

    // Маска для телефона
    const phoneInput = document.getElementById('userPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.startsWith('7') || value.startsWith('8')) {
                value = value.substring(1);
            }
            
            if (value.length > 0) {
                value = '+7 (' + value;
                
                if (value.length > 7) {
                    value = value.substring(0, 7) + ') ' + value.substring(7);
                }
                if (value.length > 12) {
                    value = value.substring(0, 12) + '-' + value.substring(12);
                }
                if (value.length > 15) {
                    value = value.substring(0, 15) + '-' + value.substring(15, 17);
                }
            }
            
            e.target.value = value;
        });
    }

    // Инициализация кнопки при загрузке
    updateSubmitButton();
}

// Функция открытия окна благодарности
function openSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (!successModal) return;
    
    const closeBtn = successModal.querySelector('.success-close-btn');
    const overlay = successModal.querySelector('.modal-overlay');
    
    if (!closeBtn || !overlay) return;
    
    // Сбрасываем и запускаем таймер
    startCountdown(15 * 60); // 15 минут в секундах
    
    // Показываем окно
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Обработчики закрытия
    closeBtn.addEventListener('click', closeSuccessModal);
    overlay.addEventListener('click', closeSuccessModal);
    
    // Закрытие по ESC
    document.addEventListener('keydown', handleSuccessEscape);
}

// Функция закрытия окна благодарности
function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (!successModal) return;
    
    successModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Останавливаем таймер
    stopCountdown();
    
    // Убираем обработчики
    document.removeEventListener('keydown', handleSuccessEscape);
}

// Обработчик ESC для окна благодарности
function handleSuccessEscape(e) {
    if (e.key === 'Escape') {
        closeSuccessModal();
    }
}

// Таймер обратного отсчета
let countdownInterval;

function startCountdown(totalSeconds) {
    const timerElement = document.getElementById('countdownTimer');
    if (!timerElement) return;
    
    let remainingSeconds = totalSeconds;
    
    // Обновляем таймер сразу
    updateTimerDisplay(timerElement, remainingSeconds);
    
    // Запускаем интервал
    countdownInterval = setInterval(() => {
        remainingSeconds--;
        
        if (remainingSeconds <= 0) {
            stopCountdown();
            timerElement.textContent = '00:00';
            timerElement.style.color = '#ff4444';
            return;
        }
        
        updateTimerDisplay(timerElement, remainingSeconds);
    }, 1000);
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function updateTimerDisplay(element, seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    element.textContent = 
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Отслеживание взаимодействий для аналитики
function trackUserInteraction(action, data = {}) {
    console.log('📊 User action:', action, data);
    
    // Интеграция с аналитикой
    if (typeof gtag !== 'undefined') {
        gtag('event', action, data);
    }
}

// Очистка ресурсов при выгрузке страницы
window.addEventListener('beforeunload', () => {
    // Очищаем кэш
    domCache.clear();
    console.log('🧹 Ресурсы очищены');
});