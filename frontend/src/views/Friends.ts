import { navigate } from '../main';
import { playTrack } from '../utils/musicPlayer';
import { authenticatedFetch } from '../utils/auth';

interface User {
    id: number;
    username: string;
    email: string;
    elo: number;
}

interface FriendRequest extends User {
    friendshipId: number; 
}

export function renderFriends(appElement: HTMLElement): void 
{
    if (!appElement) 
		return;

    appElement.innerHTML = `
    <div class="h-screen flex flex-col p-4 md:p-8 relative overflow-y-auto">

        <div id="user-details-modal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center hidden z-50 p-4">
            <div id="modal-content" class="bg-gray-800 bg-opacity-75 border-4 border-cyan-400 rounded-lg p-6 text-white text-center w-full max-w-sm relative">
            </div>
        </div>

        <div class="w-full flex justify-center mb-8">
            <img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl">
        </div>

        <div class="flex-grow flex flex-col items-center w-full max-w-4xl mx-auto space-y-8">
            
            <div class="w-full flex flex-col items-center">
                <img src="/assets/friends.png" alt="Friends" data-collapsible="friends-container" class="collapsible-trigger w-[150px] md:w-[200px] mb-4 cursor-pointer">
                <div id="friends-container" class="w-full bg-black border-4 border-cyan-400 rounded-lg p-4 overflow-y-auto shadow-lg shadow-cyan-400/50"></div>
            </div>

            <div class="w-full flex flex-col items-center">
                <img src="/assets/requests.png" alt="Friend Requests" data-collapsible="requests-container" class="collapsible-trigger w-[200px] md:w-[300px] mb-4 cursor-pointer">
                <div id="requests-container" class="w-full bg-black border-4 border-cyan-400 rounded-lg p-4 overflow-y-auto shadow-lg shadow-cyan-400/50"></div>
            </div>

            <div class="w-full flex flex-col items-center">
                <img src="/assets/users.png" alt="Users" data-collapsible="users-container" class="collapsible-trigger w-[120px] md:w-[150px] mb-4 cursor-pointer">
                <div id="users-container" class="w-full bg-black border-4 border-cyan-400 rounded-lg p-4 overflow-y-auto shadow-lg shadow-cyan-400/50 hidden"></div>
            </div>

        </div>
    </div>
    `;

    playTrack('/assets/Techno_Syndrome.mp3');

    const friendsContainer = document.getElementById('friends-container')!;
    const usersContainer = document.getElementById('users-container')!;
    const requestsContainer = document.getElementById('requests-container')!;
    const modal = document.getElementById('user-details-modal')!;
    
    document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const contentId = trigger.getAttribute('data-collapsible');
            if (contentId) {
                const contentElement = document.getElementById(contentId);
                contentElement?.classList.toggle('hidden');
            }
        });
    });

    function showUserDetailsInModal(user: User) {
        const modalContent = document.getElementById('modal-content')!;
        modalContent.innerHTML = `
            <button id="close-modal-btn" class="absolute top-2 right-4 text-white text-3xl font-bold">&times;</button>
            <h2 class="text-2xl md:text-3xl font-bold mb-4">${user.username}</h2>
            <p class="text-lg md:text-xl"><strong>Email:</strong> ${user.email}</p>
            <p class="text-lg md:text-xl"><strong>ELO:</strong> ${user.elo}</p>
        `;
        modal.classList.remove('hidden');
        document.getElementById('close-modal-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    async function loadFriends() {
        try {
            const response = await authenticatedFetch('/api/friends');
            if (!response.ok) throw new Error('Error al cargar amigos');
            const friends: User[] = await response.json();

            friendsContainer.innerHTML = friends.map(friend => `<div class="text-white text-xl md:text-3xl p-2 cursor-pointer hover:bg-gray-700" data-user-id="${friend.id}">${friend.username}</div>`).join('');

            friendsContainer.querySelectorAll('[data-user-id]').forEach(el => {
                el.addEventListener('click', async () => {
                    const userId = el.getAttribute('data-user-id');
                    try {
                        const userResponse = await authenticatedFetch(`/api/users/${userId}`);
                        const userData: User = await userResponse.json();
                        showUserDetailsInModal(userData);
                    } catch (error) {
                        alert(`Error al cargar detalles del usuario: ${(error as Error).message}`);
                    }
                });
            });
        } catch (error) {
            console.error(error);
            friendsContainer.innerHTML = `<div class="text-red-500 p-2">${(error as Error).message}</div>`;
        }
    }

    async function loadFriendRequests() {
        try {
            const response = await authenticatedFetch('/api/friends/requests');
            if (!response.ok) throw new Error('Error al cargar solicitudes');
            const requests: FriendRequest[] = await response.json();

            if (requests.length > 0) {
                requestsContainer.innerHTML = requests.map(req => `
                    <div class="flex flex-col items-center text-white text-xl md:text-3xl p-3 mb-3 border-b border-gray-600">
                        <span>${req.username}</span>
                        <div class="flex gap-2 md:gap-4 mt-2">
                            <img src="/assets/accept.png" alt="Accept" class="w-[60px] h-[40px] md:w-[70px] md:h-[50px] cursor-pointer request-action-btn" data-action="accept" data-id="${req.friendshipId}">
                            <img src="/assets/cancel.png" alt="Decline" class="w-[60px] h-[40px] md:w-[70px] md:h-[50px] cursor-pointer request-action-btn" data-action="reject" data-id="${req.friendshipId}">
                            <img src="/assets/details.png" alt="Details" class="w-[60px] h-[40px] md:w-[70px] md:h-[50px] cursor-pointer request-action-btn" data-action="details" data-user-id="${req.id}">
                        </div>
                    </div>
                `).join('');
            
                requestsContainer.querySelectorAll('.request-action-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const target = e.target as HTMLElement;
                        const action = target.dataset.action;
                        const friendshipId = target.dataset.id;
                        const userId = target.dataset.userId;

                        if (action === 'accept' && friendshipId) {
                            await handleFriendRequest(friendshipId, 'accept');
                        } else if (action === 'reject' && friendshipId) {
                            await handleFriendRequest(friendshipId, 'reject');
                        } else if (action === 'details' && userId) {
                            try {
                                const userResponse = await authenticatedFetch(`/api/users/${userId}`);
                                const userData: User = await userResponse.json();
                                showUserDetailsInModal(userData);
                            } catch (error) {
                                alert(`Error: ${(error as Error).message}`);
                            }
                        }
                    });
                });
            } else {
                requestsContainer.innerHTML = `<div class="text-gray-400 text-center text-xl md:text-2xl">No hay solicitudes pendientes</div>`;
            }

        } catch (error) {
            console.error(error);
            requestsContainer.innerHTML = `<div class="text-red-500 p-2">Error al cargar</div>`;
        }
    }

    async function handleFriendRequest(requestId: string, action: 'accept' | 'reject') {
        const url = action === 'accept' ? `/api/friends/accept/${requestId}` : `/api/friends/${requestId}`;
        const method = action === 'accept' ? 'POST' : 'DELETE';

        try {
            const response = await authenticatedFetch(url, { method });
            if (!response.ok) throw new Error(`Error al ${action === 'accept' ? 'aceptar' : 'rechazar'}`);
            
            alert(`Solicitud ${action === 'accept' ? 'aceptada' : 'rechazada'}.`);
            
            await loadFriends();
            await loadFriendRequests();
            await loadAllUsers();

        } catch (error) {
            alert(`Error: ${(error as Error).message}`);
        }
    }

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
                <div class="flex justify-between items-center text-white text-xl md:text-3xl p-2 hover:bg-gray-700">
                    <span>${user.username}</span>
                    <img src="/assets/add.png" alt="AddFriend" class="w-[50px] h-[35px] md:w-[60px] md:h-[40px] cursor-pointer add-friend-btn" data-user-id="${user.id}">
                </div>
            `).join('');
            
            usersContainer.querySelectorAll('.add-friend-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const targetUser = (e.target as HTMLElement).dataset.userId;
                    if (targetUser && currentUser.id) {
                        await sendFriendRequest(currentUser.id, parseInt(targetUser));
                    }
                });
            });

        } catch (error) {
            console.error(error);
            usersContainer.innerHTML = `<div class="text-red-500 p-2">${(error as Error).message}</div>`;
        }
    }
    
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
            alert(`Error: ${(error as Error).message}`);
        }
    }

    loadFriends();
    loadFriendRequests();
    loadAllUsers();
}
