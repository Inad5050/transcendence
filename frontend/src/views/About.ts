import { navigate } from '../main';
import { playTrack } from '../musicPlayer';

export function renderAbout(appElement: HTMLElement): void
{
	if (!appElement)
		return;
	appElement.innerHTML = `
	<div class="min-h-screen flex flex-col p-8">
		
		<div class="w-full flex justify-center">
			<img src="/assets/logo.gif" alt="Game Logo" class="max-w-5xl w-full mt-40">
		</div>

		<div class="absolute bottom-[700px] left-1/2 -translate-x-1/2">
			<img src="/assets/quickPlay.gif" alt="quickPlay" id="quickPlayButton"
		class="w-[350px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute bottom-[510px] left-1/2 -translate-x-1/2">
			<img src="/assets/tournament.gif" alt="tournament" id="tournamentButton"
		class="w-[700px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute bottom-[280px] left-1/2 -translate-x-1/2">
			<img src="/assets/ticTacToe.png" alt="ticTacToe" id="ticTacToeButton"
		class="w-[300px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute right-5 top-5">           
			<img src="/assets/profile.png" alt="profile" id="profileButton"
		class="w-[300px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute left-5 bottom-5">           
			<img src="/assets/about.png" alt="about" id="aboutButton"
		class="w-[200px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

	</div>
	`;

	playTrack('/assets/Techno_Syndrome.mp3');

	const quickPlayButton = document.getElementById('quickPlayButton');
	const tournamentButton = document.getElementById('tournamentButton');

	if (quickPlayButton)
	{
		quickPlayButton.addEventListener('click', () =>
		{
			navigate('/quickPlay');
		});
	}

	if (tournamentButton)
	{
		tournamentButton.addEventListener('click', () =>
		{
			navigate('/tournament');
		});
	}
}
