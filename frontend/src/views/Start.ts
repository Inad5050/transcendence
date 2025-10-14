import { navigate } from '../main';
import { initializeAudio, playTrack } from '../utils/musicPlayer';
import { authenticatedFetch } from '../utils/auth';

interface FriendRequest {
    id: number;
}

export function renderStart(appElement: HTMLElement): void
{
    if (!appElement)
        return;
    appElement.innerHTML = `
    <div class="h-screen flex flex-col items-center justify-start md:justify-center p-4 md:p-8 relative overflow-y-auto">
        <div class="w-full flex justify-center mt-10 md:mt-20">
            <button id="homeButton" class="focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
                <img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl">
            </button>
        </div>

        <div class="flex flex-col items-center justify-center space-y-8 my-10">
            <button id="quickPlayButton" class="bg-[url('/assets/quickPlay.gif')] bg-contain bg-no-repeat bg-center w-[450px] h-[135px] md:w-[560px] md:h-[170px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
            <button id="tournamentButton" class="bg-[url('/assets/tournament.png')] bg-contain bg-no-repeat bg-center w-[350px] h-[80px] md:w-[700px] md:h-[160px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
            <button id="ticTacToeButton" class="bg-[url('/assets/ticTacToe.png')] bg-contain bg-no-repeat bg-center w-[300px] h-[70px] md:w-[600px] md:h-[140px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
        </div>

        <div class="absolute top-4 left-4">
             <div class="flex items-start">
                <button id="friendsButton" class="bg-[url('/assets/friends.png')] bg-contain bg-no-repeat bg-center w-[150px] h-[45px] md:w-[300px] md:h-[90px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
                <div id="friend-notification-icon" class="ml-2"></div>
            </div>
        </div>

        <div class="absolute top-4 right-4">           
            <button id="profileButton" class="bg-[url('/assets/profile.png')] bg-contain bg-no-repeat bg-center w-[150px] h-[45px] md:w-[300px] md:h-[90px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
        </div>

        <div class="absolute bottom-4 left-4">           
            <button id="aboutButton" class="bg-[url('/assets/about.png')] bg-contain bg-no-repeat bg-center w-[130px] h-[40px] md:w-[250px] md:h-[75px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
        </div>
    </div>
    `;

    playTrack('/assets/Techno_Syndrome.mp3');
    
    document.getElementById('homeButton')?.addEventListener('click', () => navigate('/start'));
    const quickPlayButton = document.getElementById('quickPlayButton');
    const tournamentButton = document.getElementById('tournamentButton');
    const ticTacToeButton = document.getElementById('ticTacToeButton');
    const profileButton = document.getElementById('profileButton');
    const aboutButton = document.getElementById('aboutButton');
    const friendsButton = document.getElementById('friendsButton');

    if (quickPlayButton) {
        quickPlayButton.addEventListener('click', () => {
            localStorage.setItem('nextRoute', '/pong');
            navigate('/charQP');
            initializeAudio(); 
        });
    }
    
    if (tournamentButton) {
        tournamentButton.addEventListener('click', () => {
            localStorage.setItem('nextRoute', '/tournament');
            navigate('/charQP');
            initializeAudio(); 
        });
    }
    
    if (ticTacToeButton)
        ticTacToeButton.addEventListener('click', () => {navigate('/ticTacToe'); initializeAudio(); });
    
    if (profileButton)
        profileButton.addEventListener('click', () => {navigate('/profile'); initializeAudio(); });
    
    if (aboutButton)
        aboutButton.addEventListener('click', () => {navigate('/about'); initializeAudio(); });

    if (friendsButton)
        friendsButton.addEventListener('click', () => { navigate('/friends'); initializeAudio(); });

    const notificationIconContainer = document.getElementById('friend-notification-icon')!;

    async function checkForFriendRequests() {
        try {
            const response = await authenticatedFetch('/api/friends/requests');
            if (!response.ok) return;
            const requests: FriendRequest[] = await response.json();
            if (requests.length > 0) {
                notificationIconContainer.innerHTML = `<img src="/assets/exclamation.png" alt="New Friend Request" class="w-8 h-8 md:w-12 md:h-12 animate-pulse">`;
            }
        } catch (error) {
            console.error("No se pudieron cargar las solicitudes de amistad:", error);
        }
    }

    if (localStorage.getItem('access_token'))
        checkForFriendRequests();
}