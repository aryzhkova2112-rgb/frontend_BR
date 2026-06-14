// config.js - единый файл конфигурации
const CONFIG = {
    API_URL: 'http://localhost:5000/api'
};

// Глобальная переменная API_URL для обратной совместимости
window.API_URL = CONFIG.API_URL;