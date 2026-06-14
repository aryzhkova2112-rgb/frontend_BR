// api.js - загрузка данных для главной страницы

if (typeof window.API_URL === 'undefined') {
    window.API_URL = 'http://localhost:5000/api';
}

// Загрузка портфолио
async function loadPortfolio() {
    try {
        const response = await fetch(`${window.API_URL}/portfolio`);
        const photos = await response.json();
        const container = document.getElementById('portfolioCarousel');
        if (container && photos.length > 0) {
            container.innerHTML = '';
            photos.forEach(photo => {
                container.innerHTML += `
                    <div class="portfolio-carousel-item">
                        <img src="${photo.image_url}" alt="${photo.title || 'Работа'}">
                    </div>
                `;
            });
        } else if (container) {
            // Если нет фото в БД, показываем заглушку
            container.innerHTML = '<div class="portfolio-carousel-item">Фото пока нет</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки портфолио:', error);
        const container = document.getElementById('portfolioCarousel');
        if (container) {
            container.innerHTML = '<div class="portfolio-carousel-item">Ошибка загрузки фото</div>';
        }
    }
}

// Загрузка видео
async function loadClips() {
    try {
        const response = await fetch(`${window.API_URL}/videos`);
        const videos = await response.json();
        const container = document.getElementById('clipsCarousel');
        if (container && videos.length > 0) {
            container.innerHTML = '';
            videos.forEach(video => {
                container.innerHTML += `
                    <div class="clip-item">
                        <video src="${video.video_url}" autoplay loop muted playsinline></video>
                    </div>
                `;
            });
        } else if (container) {
            container.innerHTML = '<div class="clip-item">Видео пока нет</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки видео:', error);
        const container = document.getElementById('clipsCarousel');
        if (container) {
            container.innerHTML = '<div class="clip-item">Ошибка загрузки видео</div>';
        }
    }
}


// Загрузка цен на услуги
async function loadServicePrices() {
    try {
        const response = await fetch(`${window.API_URL}/services`);
        const services = await response.json();
        const hairService = services.find(s => s.name === 'Прическа');
        const makeupService = services.find(s => s.name === 'Макияж');

        if (hairService) {
            const hairElement = document.getElementById('hairPrice');
            if (hairElement) hairElement.textContent = `${hairService.price} РУБ`;
        }
        if (makeupService) {
            const makeupElement = document.getElementById('makeupPrice');
            if (makeupElement) makeupElement.textContent = `${makeupService.price} РУБ`;
        }
    } catch (error) {
        console.error('Ошибка загрузки цен:', error);
        // Дефолтные цены, если сервер не отвечает
        const hairElement = document.getElementById('hairPrice');
        if (hairElement) hairElement.textContent = '2500 РУБ';
        const makeupElement = document.getElementById('makeupPrice');
        if (makeupElement) makeupElement.textContent = '2000 РУБ';
    }
}

// Загрузка цен на выезд
async function loadVisitPrices() {
    try {
        const response = await fetch(`${window.API_URL}/visit-prices`);
        const prices = await response.json();

        const severodvinsk = prices.find(p => p.city === 'Северодвинск');
        const arkhangelsk = prices.find(p => p.city === 'Архангельск');
        const early = prices.find(p => p.is_early === true);

        if (severodvinsk) {
            const element = document.getElementById('severodvinskPrice');
            if (element) element.textContent = `${severodvinsk.price} РУБ`;
        }
        if (arkhangelsk) {
            const element = document.getElementById('arkhangelskPrice');
            if (element) element.textContent = `${arkhangelsk.price} РУБ`;
        }
        if (early) {
            const element = document.getElementById('earlyPrice');
            if (element) element.textContent = `${early.price} РУБ`;
        }
    } catch (error) {
        console.error('Ошибка загрузки цен на выезд:', error);
        // Дефолтные цены
        const severodvinskEl = document.getElementById('severodvinskPrice');
        if (severodvinskEl) severodvinskEl.textContent = '1000 РУБ';
        const arkhangelskEl = document.getElementById('arkhangelskPrice');
        if (arkhangelskEl) arkhangelskEl.textContent = '2000 РУБ';
        const earlyEl = document.getElementById('earlyPrice');
        if (earlyEl) earlyEl.textContent = '1000 РУБ';
    }
}

// Запуск всех загрузок при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolio();
    loadClips();
    loadServicePrices();
    loadVisitPrices();
});