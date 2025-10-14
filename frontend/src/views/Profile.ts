import { navigate } from '../main';
import { playTrack } from '../utils/musicPlayer';
import { authenticatedFetch } from '../utils/auth';

interface User {
    id: number;
    username: string;
    email: string;
    fullname: string;
    elo: number;
    twofa_enabled: boolean;
    avatar_url?: string;
}

const mockStats = {
    played: 128,
    victories: 80,
    defeats: 48,
};

const mockHistory = [
    { opponent: 'user2', result: 'Victoria', score: '3-1' },
    { opponent: 'user5', result: 'Derrota', score: '0-3' },
    { opponent: 'user3', result: 'Victoria', score: '3-2' },
];

export function renderProfile(appElement: HTMLElement): void {
    if (!appElement) return;

    const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        navigate('/login');
        return;
    }

    appElement.innerHTML = `
        <div class="h-screen flex flex-col items-center p-4 text-white overflow-y-auto">
            <h1 class="text-4xl md:text-6xl font-bold my-8 text-cyan-300 drop-shadow-lg text-center">PERFIL DE USUARIO</h1>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
                <div class="col-span-1 space-y-8">
                    <div class="bg-gray-800 bg-opacity-75 p-6 rounded-lg border-2 border-cyan-400 shadow-lg">
                        <div class="flex flex-col items-center">
                            <div class="relative mb-4">
                                <img id="avatar-img" src="${user.avatar_url || `/assets/char${user.id % 4 + 1}_profile.png`}" alt="Avatar" class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-cyan-400 object-cover">
                                <label for="avatar-upload" class="absolute bottom-0 right-0 bg-gray-900 p-2 rounded-full cursor-pointer hover:bg-cyan-500">
                                    ✏️
                                </label>
                                <input type="file" id="avatar-upload" class="hidden" accept="image/*">
                            </div>
                            
                            <div class="w-full">
                                <label class="font-bold">Username</label>
                                <input id="username-input" class="w-full bg-gray-700 p-2 rounded mt-1 mb-3 text-sm md:text-base" value="${user.username}">
                                
                                <label class="font-bold">Email</label>
                                <input id="email-input" class="w-full bg-gray-700 p-2 rounded mt-1 mb-3 text-sm md:text-base" value="${user.email}">

                                <p class="text-base md:text-lg"><span class="font-bold">ELO:</span> <span class="text-cyan-300 font-bold">${user.elo}</span></p>

                                <button id="save-profile-btn" class="w-full bg-cyan-600 hover:bg-cyan-700 py-2 rounded mt-4 font-bold">Guardar Cambios</button>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-800 bg-opacity-75 p-6 rounded-lg border-2 border-cyan-400 shadow-lg">
                        <h3 class="text-xl md:text-2xl font-bold mb-4">Seguridad</h3>
                        <div id="2fa-section"></div>
                    </div>
                </div>

                <div class="col-span-1 lg:col-span-2 space-y-8">
                    <div class="bg-gray-800 bg-opacity-75 p-6 rounded-lg border-2 border-cyan-400 shadow-lg">
                        <h3 class="text-xl md:text-2xl font-bold mb-4">Estadísticas</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p class="text-3xl md:text-4xl font-bold text-cyan-300">${mockStats.played}</p>
                                <p class="text-gray-400 text-sm">Partidas</p>
                            </div>
                            <div>
                                <p class="text-3xl md:text-4xl font-bold text-green-400">${mockStats.victories}</p>
                                <p class="text-gray-400 text-sm">Victorias</p>
                            </div>
                            <div>
                                <p class="text-3xl md:text-4xl font-bold text-red-400">${mockStats.defeats}</p>
                                <p class="text-gray-400 text-sm">Derrotas</p>
                            </div>
                            <div>
                                <p class="text-3xl md:text-4xl font-bold text-yellow-400">${((mockStats.victories / mockStats.played) * 100).toFixed(1)}%</p>
                                <p class="text-gray-400 text-sm">Ratio Vic.</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-800 bg-opacity-75 p-6 rounded-lg border-2 border-cyan-400 shadow-lg">
                        <h3 class="text-xl md:text-2xl font-bold mb-4">Historial de Partidas</h3>
                        <div id="history-container" class="space-y-3 max-h-60 md:max-h-80 overflow-y-auto pr-2">
                            ${mockHistory.map(match => `
                                <div class="flex flex-wrap justify-between items-center bg-gray-700 p-3 rounded text-sm md:text-base">
                                    <p>vs <span class="font-bold">${match.opponent}</span></p>
                                    <p class="${match.result === 'Victoria' ? 'text-green-400' : 'text-red-400'} font-bold">${match.result}</p>
                                    <p class="font-mono bg-gray-900 px-2 py-1 rounded">${match.score}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <button id="back-btn" class="my-8 bg-gray-600 hover:bg-gray-700 py-2 px-8 rounded font-bold">Volver</button>
        </div>

        <div id="2fa-modal" class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center hidden z-50 p-4">
            <div id="2fa-modal-content" class="bg-gray-900 p-6 md:p-8 rounded-lg border-4 border-cyan-500 shadow-2xl text-center relative max-w-md w-full">
            </div>
        </div>
    `;

    playTrack('/assets/Techno_Syndrome.mp3');

    document.getElementById('back-btn')?.addEventListener('click', () => navigate('/start'));
    
    setupProfileEditing(user);
    setupAvatarUpload(user);
    setup2FA(user);
}

async function setupProfileEditing(user: User) {
    document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
        const usernameInput = document.getElementById('username-input') as HTMLInputElement;
        const emailInput = document.getElementById('email-input') as HTMLInputElement;

        const updatedData: Partial<User> = {};
        if (usernameInput.value !== user.username) updatedData.username = usernameInput.value;
        if (emailInput.value !== user.email) updatedData.email = emailInput.value;

        if (Object.keys(updatedData).length === 0) {
            alert('No hay cambios para guardar.');
            return;
        }

        try {
            const response = await authenticatedFetch(`/api/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al actualizar el perfil.');
            }

            const updatedUser = await response.json();
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert('Perfil actualizado con éxito.');
            location.reload();
        } catch (error) {
            alert(`Error: ${(error as Error).message}`);
        }
    });
}

function setupAvatarUpload(user: User) {
    const uploadInput = document.getElementById('avatar-upload') as HTMLInputElement;
    const avatarImg = document.getElementById('avatar-img') as HTMLImageElement;

    uploadInput.addEventListener('change', () => {
        const file = uploadInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            avatarImg.src = reader.result as string;
        };
        reader.readAsDataURL(file);
        
        alert("La subida de avatares no está implementada en el backend. Esto es solo una previsualización.");
    });
}

function setup2FA(user: User) {
    const twoFASection = document.getElementById('2fa-section')!;
    
    const update2FAStatus = () => {
        if (user.twofa_enabled) {
            twoFASection.innerHTML = `
                <p class="text-green-400 mb-2">✔️ 2FA está ACTIVO.</p>
                <button id="disable-2fa-btn" class="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-bold">Desactivar 2FA</button>
            `;
            document.getElementById('disable-2fa-btn')?.addEventListener('click', showDisable2FAModal);
        } else {
            twoFASection.innerHTML = `
                <p class="text-yellow-400 mb-2">⚠️ 2FA está INACTIVO.</p>
                <button id="enable-2fa-btn" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold">Activar 2FA</button>
            `;
            document.getElementById('enable-2fa-btn')?.addEventListener('click', handleSetup2FA);
        }
    };

    update2FAStatus();
}

async function handleSetup2FA() {
    try {
        const response = await authenticatedFetch('/api/auth/2fa/setup', { method: 'POST' });
        if (!response.ok) throw new Error('Error al iniciar la configuración de 2FA.');
        
        const data = await response.json();
        showEnable2FAModal(data.qr_code);

    } catch (error) {
        alert(`Error: ${(error as Error).message}`);
    }
}

function showEnable2FAModal(qrCode: string) {
    const modal = document.getElementById('2fa-modal')!;
    const modalContent = document.getElementById('2fa-modal-content')!;
    
    modalContent.innerHTML = `
        <h3 class="text-2xl font-bold mb-4">Activar 2FA</h3>
        <p class="mb-4">Escanea este código QR con tu aplicación de autenticación.</p>
        <img src="${qrCode}" alt="QR Code" class="mx-auto border-4 border-white rounded-lg mb-4">
        <p class="mb-2">Luego, introduce el código de 6 dígitos para verificar.</p>
        <input id="2fa-code-input" class="w-full bg-gray-700 p-2 rounded text-center text-2xl tracking-[0.5em]" placeholder="000000" maxlength="6">
        <div class="flex gap-4 mt-4">
            <button id="verify-2fa-btn" class="w-full bg-cyan-600 hover:bg-cyan-700 py-2 rounded font-bold">Verificar</button>
            <button id="cancel-2fa-btn" class="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded font-bold">Cancelar</button>
        </div>
    `;
    modal.classList.remove('hidden');

    document.getElementById('cancel-2fa-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('verify-2fa-btn')?.addEventListener('click', async () => {
        const code = (document.getElementById('2fa-code-input') as HTMLInputElement).value;
        if (code.length !== 6) return alert('Por favor, introduce un código válido de 6 dígitos.');

        try {
            const response = await authenticatedFetch('/api/auth/2fa/enable', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            if (!response.ok) throw new Error('Código de verificación incorrecto.');
            
            alert('¡2FA activado con éxito!');
            modal.classList.add('hidden');
            location.reload();
        } catch (error) {
            alert(`Error: ${(error as Error).message}`);
        }
    });
}

function showDisable2FAModal() {
    const modal = document.getElementById('2fa-modal')!;
    const modalContent = document.getElementById('2fa-modal-content')!;

    modalContent.innerHTML = `
        <h3 class="text-2xl font-bold mb-4">Desactivar 2FA</h3>
        <p class="mb-4">Para confirmar, introduce tu contraseña y un código 2FA actual.</p>
        
        <label>Contraseña</label>
        <input id="password-input" type="password" class="w-full bg-gray-700 p-2 rounded mt-1 mb-3">

        <label>Código 2FA</label>
        <input id="2fa-code-input" class="w-full bg-gray-700 p-2 rounded text-center text-2xl tracking-[0.5em] mt-1" placeholder="000000" maxlength="6">
        
        <div class="flex gap-4 mt-4">
            <button id="confirm-disable-btn" class="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-bold">Desactivar</button>
            <button id="cancel-disable-btn" class="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded font-bold">Cancelar</button>
        </div>
    `;
    modal.classList.remove('hidden');

    document.getElementById('cancel-disable-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('confirm-disable-btn')?.addEventListener('click', async () => {
        const password = (document.getElementById('password-input') as HTMLInputElement).value;
        const code = (document.getElementById('2fa-code-input') as HTMLInputElement).value;

        if (!password || !code) return alert('Debes completar ambos campos.');

        try {
            const response = await authenticatedFetch('/api/auth/2fa/disable', {
                method: 'POST',
                body: JSON.stringify({ password, code }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al desactivar 2FA.');
            
            alert('¡2FA desactivado con éxito! Se cerrarán todas tus sesiones.');
            modal.classList.add('hidden');
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            alert(`Error: ${(error as Error).message}`);
        }
    });
}
