// auth.js - авторизация через бэкенд API

if (typeof window.API_URL === 'undefined') {
    window.API_URL = 'http://localhost:5000/api';
}

async function loginUser(username, password, role) {
    try {
        // КЛИЕНТ: вход без проверки пароля
        if (role === 'client') {
            sessionStorage.setItem('user', JSON.stringify({
                username: 'client',
                role: 'client',
                name: 'Клиент',
                user_id: 3
            }));
            return true;
        }

        const response = await fetch(`${window.API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();

        if (data.success) {
            sessionStorage.setItem('user', JSON.stringify({
                username: username,
                role: data.role,
                name: data.name,
                user_id: data.user_id
            }));
            return true;
        } else {
            alert(data.error || 'Неверные данные!');
            return false;
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        alert('Ошибка подключения к серверу. Убедитесь, что бэкенд запущен.');
        return false;
    }
}

// Проверяем, существует ли уже обработчик (чтобы не дублировать)
if (typeof window.loginFormInitialized === 'undefined') {
    window.loginFormInitialized = true;

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            const success = await loginUser(username, password, role);

            if (success) {
                window.location.href = 'index.html';
            }
        });
    }
}