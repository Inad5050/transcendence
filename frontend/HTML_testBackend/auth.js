// auth.js - Sistema de autenticación compartido
// Este archivo se debe incluir en todas las páginas de test

class AuthManager {
    constructor() {
        this.API_BASE_URL = window.location.origin;
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
    }

    // 🔐 Obtener token de acceso
    getAccessToken() {
        if (!this.accessToken) {
            this.accessToken = localStorage.getItem('access_token');
        }
        return this.accessToken;
    }

    // 🔄 Obtener token de refresco
    getRefreshToken() {
        if (!this.refreshToken) {
            this.refreshToken = localStorage.getItem('refresh_token');
        }
        return this.refreshToken;
    }

    // 👤 Obtener usuario actual
    getCurrentUser() {
        if (!this.user) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    this.user = JSON.parse(userStr);
                } catch (error) {
                    console.error('Error al parsear usuario:', error);
                    this.clearSession();
                    return null;
                }
            }
        }
        return this.user;
    }

    // ✅ Verificar si está autenticado
    isAuthenticated() {
        return !!this.getAccessToken() && !!this.getCurrentUser();
    }

    // 💾 Guardar sesión
    saveSession(accessToken, refreshToken, user) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;

        console.log('✅ Sesión guardada');
    }

    // 🗑️ Limpiar sesión
    clearSession() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;

        console.log('🗑️ Sesión limpiada');
    }

    // 🚀 Hacer petición autenticada
    async authenticatedFetch(url, options = {}) {
        const token = this.getAccessToken();
        
        if (!token) {
            throw new Error('No hay token de acceso');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        // Solo añadir Content-Type si hay body
        if (options.body) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Si el token expiró (401), intentar refrescar
        if (response.status === 401) {
            console.log('🔄 Token expirado, intentando refrescar...');
            const refreshed = await this.refreshAccessToken();
            
            if (refreshed) {
                // Reintentar la petición con el nuevo token
                headers.Authorization = `Bearer ${this.getAccessToken()}`;
                return await fetch(url, {
                    ...options,
                    headers
                });
            } else {
                // No se pudo refrescar, redirigir al login
                this.redirectToLogin();
                throw new Error('Sesión expirada');
            }
        }

        return response;
    }

    // 🔄 Refrescar token de acceso
    async refreshAccessToken() {
        try {
            const refreshToken = this.getRefreshToken();
            
            if (!refreshToken) {
                return false;
            }

            const response = await fetch(`${this.API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.access_token;
                localStorage.setItem('access_token', data.access_token);
                console.log('✅ Token refrescado');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error al refrescar token:', error);
            return false;
        }
    }

    // 🚪 Cerrar sesión
    async logout() {
        try {
            const token = this.getAccessToken();
            
            if (token) {
                await fetch(`${this.API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            this.clearSession();
            this.redirectToLogin();
        }
    }

    // 🔀 Redirigir al login
    redirectToLogin() {
        window.location.href = 'loging.html';
    }

    // 🛡️ Proteger página (requiere autenticación)
    requireAuth() {
        if (!this.isAuthenticated()) {
            console.log('❌ No autenticado, redirigiendo al login...');
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    // 📊 Mostrar información del usuario en la página
    renderUserInfo(containerId = 'userInfoContainer') {
        const user = this.getCurrentUser();
        const container = document.getElementById(containerId);
        
        if (!container || !user) return;

        container.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #667eea;">👤 Usuario:</strong> ${user.username}
                        <span style="margin-left: 20px;"><strong style="color: #667eea;">📧 Email:</strong> ${user.email}</span>
                    </div>
                    <button id="logoutBtnNav" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </div>
        `;

        // Agregar evento al botón de logout
        document.getElementById('logoutBtnNav').addEventListener('click', () => {
            this.logout();
        });
    }

    // 🧭 Renderizar menú de navegación
    renderNavigationMenu(containerId = 'navMenuContainer', currentPage = '') {
        const container = document.getElementById(containerId);
        
        if (!container) return;

        const pages = [
            { name: 'Login', url: 'loging.html', icon: '🔐' },
            { name: 'Dashboard', url: 'dashboard.html', icon: '📊' },
            { name: 'Crear Usuario', url: 'createUser.html', icon: '📝' },
            { name: 'Test JWT', url: 'testJWT.html', icon: '🔑' },
            { name: 'Test 2FA', url: 'test2fa.html', icon: '🔒' }
        ];

        let menuHTML = '<div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">';
        menuHTML += '<div style="display: flex; gap: 10px; flex-wrap: wrap;">';

        pages.forEach(page => {
            const isActive = currentPage === page.url;
            const style = isActive 
                ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;'
                : 'background: #f8f9fa; color: #333; border: 2px solid #e0e0e0;';
            
            menuHTML += `
                <a href="${page.url}" style="${style} padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-block;">
                    ${page.icon} ${page.name}
                </a>
            `;
        });

        menuHTML += '</div></div>';
        container.innerHTML = menuHTML;
    }
}

// Crear instancia global
const authManager = new AuthManager();

// Función auxiliar para inicializar página protegida
function initProtectedPage(pageName = '') {
    // Verificar autenticación
    if (!authManager.requireAuth()) {
        return false;
    }

    // Renderizar información del usuario
    authManager.renderUserInfo();
    
    // Renderizar menú de navegación
    authManager.renderNavigationMenu('navMenuContainer', pageName);

    console.log('✅ Página protegida inicializada');
    return true;
}

console.log('✅ auth.js cargado');
