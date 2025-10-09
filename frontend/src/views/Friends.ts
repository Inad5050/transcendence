import { navigate } from '../main';
import { playTrack } from '../musicPlayer';


interface User // Mock de datos de usuario para la ventana de detalles
{
    id: number;
    username: string;
    email: string;
    elo: number;
}


function getAccessToken(): string | null // Función para obtener el token de acceso de localStorage
{
    return localStorage.getItem('access_token');
}

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> // Función para realizar peticiones autenticadas
{
    const token = getAccessToken();
    if (!token) 
	{
        navigate('/login');
        throw new Error('No estás autenticado.');
    }
    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Bearer ${token}`);
    return fetch(url, { ...options, headers });
}

// Renderiza la vista de Amigos
export function renderFriends(appElement: HTMLElement): void {
    if (!appElement) return;

    appElement.innerHTML = `
    <div class="min-h-screen flex flex-col p-8 relative">

		<div class="w-full flex justify-center">
			<img src="/assets/logo.gif" alt="Game Logo" class="max-w-5xl w-full mt-40">
		</div>

        <div class="w-full flex justify-around items-start mt-16">

            <div class="w-1/4 flex flex-col items-center">
                <img src="/assets/friends.png" alt="Friends" class="w-[250px] mb-4">
                <div id="friends-container" class="w-full h-[400px] bg-black border-4 border-cyan-400 rounded-lg p-4 overflow-y-auto shadow-2xl shadow-cyan-400/50"></div>
            </div>

            <div id="user-details-container" class="w-1/4 flex justify-center"></div>

            <div class="w-1/4 flex flex-col items-center">
                <img src="/assets/users.png" alt="Users" id="users-button" class="w-[200px] mb-4 cursor-pointer">
                <div id="users-container" class="w-full h-[400px] bg-black border-4 border-cyan-400 rounded-lg p-4 overflow-y-auto shadow-2xl shadow-cyan-400/50 hidden"></div>
            </div>

        </div>

    </div>
    `;

    playTrack('/assets/Techno_Syndrome.mp3');

    const friendsContainer = document.getElementById('friends-container')!;
    const usersContainer = document.getElementById('users-container')!;
    const userDetailsContainer = document.getElementById('user-details-container')!;
    const usersButton = document.getElementById('users-button')!;

    async function loadFriends() 
	{
        try 
		{
            const response = await authenticatedFetch('/api/friends');
            if (!response.ok) 
				throw new Error('Error al cargar amigos');

            const friends: User[] = await response.json();

            friendsContainer.innerHTML = friends.map(friend => `<div class="text-white text-2xl p-2 cursor-pointer hover:bg-gray-700" data-user-id="${friend.id}">${friend.username}</div>`).join('');

            friendsContainer.querySelectorAll('[data-user-id]').forEach(el => {
                el.addEventListener('click', async () => {
                    const userId = el.getAttribute('data-user-id');
                    const userResponse = await authenticatedFetch(`/api/users/${userId}`);
                    const userData: User = await userResponse.json();
                    showUserDetails(userData);
                });
            });
        } catch (error) {
            console.error(error);
            friendsContainer.innerHTML = `<div class="text-red-500 p-2">${error.message}</div>`;
        }
    }
    
    // Mostrar/ocultar lista de todos los usuarios
    usersButton.addEventListener('click', async () => {
        if (usersContainer.classList.contains('hidden')) {
            await loadAllUsers();
            usersContainer.classList.remove('hidden');
        } else {
            usersContainer.classList.add('hidden');
        }
    });

    // Cargar todos los usuarios (que no son amigos)
    async function loadAllUsers() {
        try {
            const [usersResponse, friendsResponse] = await Promise.all([
                authenticatedFetch('/api/users'),
                authenticatedFetch('/api/friends')
            ]);

            if (!usersResponse.ok || !friendsResponse.ok) throw new Error('Error al cargar datos');

            const allUsers: User[] = await usersResponse.json();
            const friends: User[] = await friendsResponse.json();
            const friendIds = new Set(friends.map(f => f.id));
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            
            const otherUsers = allUsers.filter(user => user.id !== currentUser.id && !friendIds.has(user.id));
            
            usersContainer.innerHTML = otherUsers.map(user => `
                <div class="flex justify-between items-center text-white text-2xl p-2 hover:bg-gray-700">
                    <span>${user.username}</span>
                    <img src="/assets/accept.png" alt="Add Friend" class="w-8 h-8 cursor-pointer add-friend-btn" data-user-id="${user.id}">
                </div>
            `).join('');
            
            // Añadir event listeners a los botones de añadir amigo
            usersContainer.querySelectorAll('.add-friend-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const targetUser = (e.target as HTMLElement).dataset.userId;
                    if (targetUser && currentUser.id) {
                        sendFriendRequest(currentUser.id, parseInt(targetUser));
                    }
                });
            });

        } catch (error) {
            console.error(error);
            usersContainer.innerHTML = `<div class="text-red-500 p-2">${error.message}</div>`;
        }
    }
    
    // Enviar solicitud de amistad
    async function sendFriendRequest(fromId: number, toId: number) {
        try {
            const response = await authenticatedFetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ one_user_id: fromId, two_user_id: toId })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Error al enviar la solicitud');
            alert('Solicitud de amistad enviada!');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    // Mostrar detalles de un usuario
    function showUserDetails(user: User) {
        userDetailsContainer.innerHTML = `
        <div class="bg-gray-800 bg-opacity-75 border-4 border-cyan-400 rounded-lg p-6 text-white text-center w-full max-w-sm">
            <h2 class="text-3xl font-bold mb-4">${user.username}</h2>
            <p class="text-xl"><strong>Email:</strong> ${user.email}</p>
            <p class="text-xl"><strong>ELO:</strong> ${user.elo}</p>
        </div>
        `;
    }

    loadFriends();
}
