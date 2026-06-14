// Вспомогательная функция для извлечения имени файла из URL
function getFileNameFromUrl(url) {
    if (!url) return 'неизвестный файл';

    try {
        // Убираем параметры после ? если есть
        let cleanUrl = url.split('?')[0];
        // Разбиваем по слешам и берем последнюю часть
        let parts = cleanUrl.split('/');
        let fileName = parts[parts.length - 1];

        // Если имя файла слишком длинное, обрезаем
        if (fileName.length > 40) {
            fileName = fileName.substring(0, 35) + '...';
        }

        return fileName;
    } catch (e) {
        return url.substring(0, 40);
    }
}

// ============================================
// АДМИН-ПАНЕЛЬ ЧЕРЕЗ БЭКЕНД API
// ============================================

if (typeof window.API_URL === 'undefined') {
    window.API_URL = 'http://localhost:5000/api';
}

(function() {
    let currentUser = null;

    // Загрузка данных пользователя из sessionStorage
    try {
        const userData = sessionStorage.getItem('user');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('Пользователь загружен:', currentUser);
        }
    } catch (e) {
        console.error('Ошибка загрузки пользователя:', e);
    }

    // ============================================
    // 1. ИНИЦИАЛИЗАЦИЯ ПАНЕЛИ
    // ============================================
    async function initAdminPanel() {
        console.log('initAdminPanel вызван, currentUser:', currentUser);

        if (!currentUser) {
            console.log('Нет пользователя');
            return;
        }

        // КЛИЕНТ: панель НЕ ПОКАЗЫВАЕМ
        if (currentUser.role === 'client') {
            console.log('Клиент: панель скрыта');
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) adminPanel.style.display = 'none';
            return;
        }

        // Админ и менеджер: показываем панель
        const adminPanel = document.getElementById('adminPanel');
        const userInfoSpan = document.getElementById('userInfo');

        if (adminPanel) {
            adminPanel.style.display = 'block';
            console.log('Панель показана');
        }
        if (userInfoSpan) {
            userInfoSpan.innerHTML = ` ${currentUser.name} (${getRoleName(currentUser.role)})`;
        }

        const priceControls = document.getElementById('priceControls');
        const mediaControls = document.getElementById('mediaControls');

        if (priceControls) priceControls.style.display = 'none';
        if (mediaControls) mediaControls.style.display = 'none';

        if (currentUser.role === 'manager') {
            console.log('Менеджер: показываем управление ценами');
            if (priceControls) priceControls.style.display = 'block';
            await loadPricesFromAPI();
            await loadVisitPricesFromAPI();
        }

        if (currentUser.role === 'admin') {
            console.log('Админ: показываем управление медиа');
            if (mediaControls) mediaControls.style.display = 'block';
            await loadVideoListFromAPI();
            await loadPhotoListFromAPI();
        }
    }

    function getRoleName(role) {
        const roles = {
            'admin': 'Администратор',
            'manager': 'Алёна Рыжкова (Менеджер)',
            'client': 'Клиент'
        };
        return roles[role] || role;
    }

    // ============================================
    // 2. ЗАГРУЗКА И ОБНОВЛЕНИЕ ЦЕН НА УСЛУГИ
    // ============================================
    async function loadPricesFromAPI() {
        try {
            const response = await fetch(`${window.API_URL}/services`);
            const services = await response.json();

            const hairService = services.find(s => s.category === 'hair' || s.name === 'Прическа');
            const makeupService = services.find(s => s.category === 'makeup' || s.name === 'Макияж');

            if (hairService) {
                const hairInput = document.getElementById('editHairPrice');
                if (hairInput) hairInput.value = hairService.price;
                const hairPriceElement = document.getElementById('hairPrice');
                if (hairPriceElement) hairPriceElement.textContent = `${hairService.price} РУБ`;
            }
            if (makeupService) {
                const makeupInput = document.getElementById('editMakeupPrice');
                if (makeupInput) makeupInput.value = makeupService.price;
                const makeupPriceElement = document.getElementById('makeupPrice');
                if (makeupPriceElement) makeupPriceElement.textContent = `${makeupService.price} РУБ`;
            }

            window.services = services;
        } catch (error) {
            console.error('Ошибка загрузки цен:', error);
            alert('Ошибка загрузки цен. Проверьте подключение к серверу.');
        }
    }

    async function updatePriceOnAPI(serviceId, newPrice) {
        try {
            const response = await fetch(`${window.API_URL}/services/${serviceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: newPrice, user_id: currentUser?.user_id || 1 })
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления цены:', error);
            return { success: false };
        }
    }

    // Кнопка сохранения цен
    const savePricesBtn = document.getElementById('savePricesBtn');
    if (savePricesBtn) {
        savePricesBtn.addEventListener('click', async () => {
            const hairPrice = parseInt(document.getElementById('editHairPrice').value);
            const makeupPrice = parseInt(document.getElementById('editMakeupPrice').value);

            if (window.services) {
                const hairService = window.services.find(s => s.category === 'hair' || s.name === 'Прическа');
                const makeupService = window.services.find(s => s.category === 'makeup' || s.name === 'Макияж');

                if (hairService) await updatePriceOnAPI(hairService.id, hairPrice);
                if (makeupService) await updatePriceOnAPI(makeupService.id, makeupPrice);

                alert('Цены на услуги обновлены!');
                await loadPricesFromAPI();
            }
        });
    }

    // ============================================
    // 3. ЗАГРУЗКА И ОБНОВЛЕНИЕ ЦЕН НА ВЫЕЗД
    // ============================================
    async function loadVisitPricesFromAPI() {
        try {
            const response = await fetch(`${window.API_URL}/visit-prices`);
            const prices = await response.json();

            const severodvinsk = prices.find(p => p.city === 'Северодвинск');
            const arkhangelsk = prices.find(p => p.city === 'Архангельск');
            const early = prices.find(p => p.is_early === true);

            if (severodvinsk) {
                const input = document.getElementById('editSeverodvinskPrice');
                if (input) input.value = severodvinsk.price;
                const element = document.getElementById('severodvinskPrice');
                if (element) element.textContent = `${severodvinsk.price} РУБ`;
            }
            if (arkhangelsk) {
                const input = document.getElementById('editArkhangelskPrice');
                if (input) input.value = arkhangelsk.price;
                const element = document.getElementById('arkhangelskPrice');
                if (element) element.textContent = `${arkhangelsk.price} РУБ`;
            }
            if (early) {
                const input = document.getElementById('editEarlyPrice');
                if (input) input.value = early.price;
                const element = document.getElementById('earlyPrice');
                if (element) element.textContent = `${early.price} РУБ`;
            }

            window.visitPrices = prices;
        } catch (error) {
            console.error('Ошибка загрузки цен на выезд:', error);
            alert('Ошибка загрузки цен на выезд.');
        }
    }

    async function updateVisitPriceOnAPI(priceId, newPrice) {
        try {
            const response = await fetch(`${window.API_URL}/visit-prices/${priceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: newPrice })
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления цены выезда:', error);
            return { success: false };
        }
    }

    const saveVisitPricesBtn = document.getElementById('saveVisitPricesBtn');
    if (saveVisitPricesBtn) {
        saveVisitPricesBtn.addEventListener('click', async () => {
            const severodvinskPrice = parseInt(document.getElementById('editSeverodvinskPrice').value);
            const arkhangelskPrice = parseInt(document.getElementById('editArkhangelskPrice').value);
            const earlyPrice = parseInt(document.getElementById('editEarlyPrice').value);

            if (window.visitPrices) {
                const severodvinsk = window.visitPrices.find(p => p.city === 'Северодвинск');
                const arkhangelsk = window.visitPrices.find(p => p.city === 'Архангельск');
                const early = window.visitPrices.find(p => p.is_early === true);

                if (severodvinsk) await updateVisitPriceOnAPI(severodvinsk.id, severodvinskPrice);
                if (arkhangelsk) await updateVisitPriceOnAPI(arkhangelsk.id, arkhangelskPrice);
                if (early) await updateVisitPriceOnAPI(early.id, earlyPrice);

                alert('Цены на выезд обновлены!');
                await loadVisitPricesFromAPI();
            }
        });
    }

    // ============================================
    // 4. УПРАВЛЕНИЕ ФОТО (ПОРТФОЛИО) - ТОЛЬКО АДМИН
    // ============================================

    async function loadPhotoListFromAPI() {
        try {
            const response = await fetch(`${window.API_URL}/portfolio`);
            const photos = await response.json();
            window.photosList = photos;

            const container = document.getElementById('photoList');
            if (container) {
                if (photos.length === 0) {
                    container.innerHTML = '<h4>Список фото на сайте:</h4><p>Нет фото</p>';
                } else {
                    let html = '<h4>Список фото на сайте:</h4>';
                    photos.forEach((photo) => {
                        // Извлекаем только имя файла из полной ссылки
                        let fileName = getFileNameFromUrl(photo.image_url);
                        html += `<div class="media-item">
                            <span title="${photo.image_url}">${fileName}</span>
                            <button class="delete-photo-btn" data-id="${photo.id}">Удалить</button>
                        </div>`;
                    });
                    container.innerHTML = html;
                }
            }

            document.querySelectorAll('.delete-photo-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = parseInt(btn.dataset.id);
                    await fetch(`${window.API_URL}/portfolio/${id}`, { method: 'DELETE' });
                    await loadPhotoListFromAPI();
                    alert('Фото удалено!');
                });
            });
        } catch (error) {
            console.error('Ошибка загрузки фото:', error);
            alert('Ошибка загрузки списка фото.');
        }
    }

    // ============================================
    // 5. УПРАВЛЕНИЕ ВИДЕО - ТОЛЬКО АДМИН
    // ============================================

    async function loadVideoListFromAPI() {
        try {
            const response = await fetch(`${window.API_URL}/videos`);
            const videos = await response.json();
            window.videosList = videos;

            const container = document.getElementById('videoList');
            if (container) {
                if (videos.length === 0) {
                    container.innerHTML = '<h4>Список видео на сайте:</h4><p>Нет видео</p>';
                } else {
                    let html = '<h4>Список видео на сайте:</h4>';
                    videos.forEach((video) => {
                        // Извлекаем только имя файла из полной ссылки
                        let fileName = getFileNameFromUrl(video.video_url);
                        html += `<div class="media-item">
                            <span title="${video.video_url}">${fileName}</span>
                            <button class="delete-video-btn" data-id="${video.id}">Удалить</button>
                        </div>`;
                    });
                    container.innerHTML = html;
                }
            }

            document.querySelectorAll('.delete-video-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = parseInt(btn.dataset.id);
                    await fetch(`${window.API_URL}/videos/${id}`, { method: 'DELETE' });
                    await loadVideoListFromAPI();
                    alert('Видео удалено!');
                });
            });
        } catch (error) {
            console.error('Ошибка загрузки видео:', error);
            alert('Ошибка загрузки списка видео.');
        }
    }
    // ============================================
    // 6. КНОПКИ ДОБАВЛЕНИЯ (ТОЛЬКО АДМИН)
    // ============================================
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', async () => {
            const newPhoto = document.getElementById('newPhotoUrl').value.trim();
            if (newPhoto) {
                try {
                    await fetch(`${window.API_URL}/portfolio`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image_url: newPhoto, title: '', user_id: currentUser?.user_id || 1 })
                    });
                    await loadPhotoListFromAPI();
                    document.getElementById('newPhotoUrl').value = '';
                    alert('Фото добавлено!');
                } catch (error) {
                    console.error('Ошибка добавления фото:', error);
                    alert('Ошибка добавления фото.');
                }
            } else {
                alert('Введите путь к фото (например: portfolio6.png)');
            }
        });
    }

    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', async () => {
            const newVideo = document.getElementById('newVideoUrl').value.trim();
            if (newVideo) {
                try {
                    await fetch(`${window.API_URL}/videos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ video_url: newVideo, title: '', user_id: currentUser?.user_id || 1 })
                    });
                    await loadVideoListFromAPI();
                    document.getElementById('newVideoUrl').value = '';
                    alert('Видео добавлено!');
                } catch (error) {
                    console.error('Ошибка добавления видео:', error);
                    alert('Ошибка добавления видео.');
                }
            } else {
                alert('Введите путь к видео (например: work6.mp4)');
            }
        });
    }

    // ============================================
    // 7. КНОПКА ВЫХОДА
    // ============================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // ============================================
    // 8. ЗАПУСК ИНИЦИАЛИЗАЦИИ
    // ============================================
    initAdminPanel().catch(error => {
        console.error('Ошибка инициализации панели:', error);
    });
})();