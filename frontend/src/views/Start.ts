import { navigate } from '../main';
import { initializeAudio, playTrack } from '../musicPlayer';

// Interfaz para las solicitudes de amistad
interface FriendRequest {
    id: number;
    username: string;
    // ... otros campos que pueda devolver la API
}

// Función para obtener el token de acceso
function getAccessToken(): string | null {
    return localStorage.getItem('access_token');
}

// Función para peticiones autenticadas
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAccessToken();
    if (!token) {
        navigate('/login');
        throw new Error('No autenticado.');
    }
    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Bearer ${token}`);
    return fetch(url, { ...options, headers });
}

export function renderStart(appElement: HTMLElement): void
{
	if (!appElement)
		return;
	appElement.innerHTML = `
	<div class="min-h-screen flex flex-col p-8 relative">
	
        <div id="friend-request-notification" class="absolute top-5" style="left: 25%;"></div>

		<div class="w-full flex justify-center">
			<img src="/assets/logo.gif" alt="Game Logo" class="max-w-5xl w-full mt-40">
		</div>

		<div class="absolute bottom-[700px] left-1/2 -translate-x-1/2">
			<img src="/assets/quickPlay.gif" alt="quickPlay" id="quickPlayButton"
		class="w-[350px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute bottom-[500px] left-1/2 -translate-x-1/2">
			<img src="/assets/tournament.png" alt="tournament" id="tournamentButton"
		class="w-[700px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

        <div class="absolute left-5 top-5">
			<img src="/assets/friends.png" alt="Friends" id="friendsButton"
		class="w-[300px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute bottom-[300px] left-1/2 -translate-x-1/2">
			<img src="/assets/ticTacToe.png" alt="ticTacToe" id="ticTacToeButton"
		class="w-[600px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute right-5 top-5">           
			<img src="/assets/profile.png" alt="profile" id="profileButton"
		class="w-[300px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute left-5 bottom-5">           
			<img src="/assets/about.png" alt="about" id="aboutButton"
		class="w-[250px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>
	</div>
	`;

	playTrack('/assets/Techno_Syndrome.mp3');

    const quickPlayButton = document.getElementById('quickPlayButton');
	const tournamentButton = document.getElementById('tournamentButton');
	const ticTacToeButton = document.getElementById('ticTacToeButton');
	const profileButton = document.getElementById('profileButton');
	const aboutButton = document.getElementById('aboutButton');
    const friendsButton = document.getElementById('friendsButton');

	if (quickPlayButton)
		quickPlayButton.addEventListener('click', () => {navigate('/charQP'); initializeAudio(); });
	
	if (tournamentButton)
		tournamentButton.addEventListener('click', () => {navigate('/charTournament'); initializeAudio(); });
	
	if (ticTacToeButton)
		ticTacToeButton.addEventListener('click', () => {navigate('/ticTacToe'); initializeAudio(); });
	
	if (profileButton)
		profileButton.addEventListener('click', () => {navigate('/profile'); initializeAudio(); });
	
	if (aboutButton)
		aboutButton.addEventListener('click', () => {navigate('/about'); initializeAudio(); });

    if (friendsButton)
        friendsButton.addEventListener('click', () => { navigate('/friends'); initializeAudio(); });

    // Lógica para notificaciones de amistad
    const notificationContainer = document.getElementById('friend-request-notification')!;

    async function checkFriendRequests() 
	{
        try 
		{
            const response = await authenticatedFetch('/api/friends/requests');
            if (!response.ok) 
				return;
            const requests: FriendRequest[] = await response.json();

            if (requests.length > 0) 
			{
                const request = requests[0]; // Mostramos solo la primera notificación
                notificationContainer.innerHTML = `
                <div class="relative">
                    <img src="/assets/story.png" alt="New Request" id="request-icon" class="w-16 h-16 cursor-pointer animate-pulse">
                    <div id="request-popup" class="hidden absolute top-full left-0 bg-gray-800 border-2 border-cyan-400 p-2 rounded-lg flex gap-2">
                        <img src="/assets/accept.png" alt="Accept" class="w-12 h-12 cursor-pointer" data-action="accept" data-id="${request.id}">
                        <img src="/assets/cancel.png" alt="Cancel" class="w-12 h-12 cursor-pointer" data-action="reject" data-id="${request.id}">
                        <img src="/assets/profile.png" alt="Profile" class="w-12 h-12 cursor-pointer" data-action="profile" data-id="${request.id}">
                    </div>
                </div>
                `;

                const icon = document.getElementById('request-icon');
                const popup = document.getElementById('request-popup');

                icon?.addEventListener('click', () => {popup?.classList.toggle('hidden');});

                popup?.addEventListener('click', async (e) => {
                    const target = e.target as HTMLElement;
                    const action = target.dataset.action;
                    const requestId = target.dataset.id;
                    if (!action || !requestId) return;

                    try {
                        let response;
                        switch (action) {
                            case 'accept':
                                response = await authenticatedFetch(`/api/friends/accept/${requestId}`, { method: 'POST' });
                                if (response.ok) alert('Amistad aceptada!');
                                break;
                            case 'reject':
                                response = await authenticatedFetch(`/api/friends/${requestId}`, { method: 'DELETE' });
                                if (response.ok) alert('Solicitud rechazada.');
                                break;
                            case 'profile':
                                // Aquí puedes implementar una ventana modal con los detalles del usuario
                                alert(`Mostrando perfil de usuario con ID: ${requestId}`);
                                break;
                        }
                        notificationContainer.innerHTML = ''; // Limpiar notificación
                    } catch (err) {
                        alert(`Error: ${(err as Error).message}`);
                    }
                });
            }
        } catch (error) {
            console.error("No se pudieron cargar las solicitudes de amistad:", error);
        }
    }

    if (getAccessToken()) {
        checkFriendRequests();
    }
}
