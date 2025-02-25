const apiUrl = "http://localhost:4404";

function getAccessToken() {
    return localStorage.getItem("token");
}

function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

function getUserId() {
    return localStorage.getItem("userId");
}

async function refreshTokens() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        alert("Нет refresh токена!");
        return false;
    }
    const response = await fetch(`${apiUrl}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (data.accessToken && data.refreshToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        console.log("Токены успешно обновлены!");
        return true;
    } else {
        alert(data.message || "Ошибка при обновлении токенов");
        return false;
    }
}

async function authFetch(url, options = {}) {
    let accessToken = getAccessToken();
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${accessToken}`;

    let response = await fetch(url, options);
    if (response.status === 401) {
        console.log("Access token недействителен, пытаемся обновить...");
        const refreshed = await refreshTokens();
        if (refreshed) {
            accessToken = getAccessToken();
            options.headers.Authorization = `Bearer ${accessToken}`;
            response = await fetch(url, options);
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");
            alert("Ваша сессия истекла. Пожалуйста, войдите заново.");
        }
    }
    return response;
}
