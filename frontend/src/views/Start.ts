import { navigate } from '../main';
import { initializeAudio, playTrack } from '../musicPlayer';
import { authenticatedFetch } from '../utils/auth';

interface FriendRequest {
    id: number;
}

export function renderStart(appElement: HTMLElement): void
{
    if (!appElement)
        return;
    appElement.innerHTML = `
    <div class="min-h-screen flex flex-col items-center p-4 md:p-8 relative overflow-y-auto">
    
        <div class="w-full flex justify-center mt-10 md:mt-20">
            <img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl">
        </div>

        <div class="flex flex-col items-center justify-center space-y-8 my-10">
            <img src="/assets/quickPlay.gif" alt="quickPlay" id="quickPlayButton"
                class="w-[280px] md:w-[350px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">

            <img src="/assets/tournament.png" alt="tournament" id="tournamentButton"
                class="w-[350px] md:w-[700px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">

            <img src="/assets/ticTacToe.png" alt="ticTacToe" id="ticTacToeButton"
                class="w-[300px] md:w-[600px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
        </div>

        <div class="absolute top-4 left-4">
             <div class="flex items-start">
                <img src="/assets/friends.png" alt="Friends" id="friendsButton"
                    class="w-[150px] md:w-[300px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
                <div id="friend-notification-icon" class="ml-2"></div>
            </div>
        </div>

        <div class="absolute top-4 right-4">           
            <img src="/assets/profile.png" alt="profile" id="profileButton"
                class="w-[150px] md:w-[300px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
        </div>

        <div class="absolute bottom-4 left-4">           
            <img src="/assets/about.png" alt="about" id="aboutButton"
                class="w-[130px] md:w-[250px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
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

    const notificationIconContainer = document.getElementById('friend-notification-icon')!;

    async function checkForFriendRequests() 
    {
        try 
        {
            const response = await authenticatedFetch('/api/friends/requests');
            if (!response.ok) 
                return;
            
            const requests: FriendRequest[] = await response.json();

            if (requests.length > 0) 
            {
                notificationIconContainer.innerHTML = `
                    <img src="/assets/exclamation.png" alt="New Friend Request" class="w-8 h-8 md:w-12 md:h-12 animate-pulse">
                `;
            }
        } catch (error) {
            console.error("No se pudieron cargar las solicitudes de amistad:", error);
        }
    }

    if (localStorage.getItem('access_token'))
        checkForFriendRequests();
}