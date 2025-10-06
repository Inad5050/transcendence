const musicElement = document.getElementById('background-music') as HTMLAudioElement; // Se obtiene el elemento de audio una sola vez para reutilizarlo.
let isInitialized = false; // Controla si el usuario ha interactuado para iniciar la música.

/**
 * Cambia la pista de audio y la reproduce.
 * @param trackUrl La URL del archivo de música a reproducir.
 */
export function playTrack(trackUrl: string): void
{
    if (musicElement.src.endsWith(trackUrl)) // Si la pipsta solicitada ya está cargada o sonando, no hace nada
		return;
	musicElement.src = trackUrl;
	musicElement.load(); // Carga el nuevo archivo de audio.
	if (isInitialized) // No hace nada si el elemento no existe o la música no ha sido inicializada por el usuario.
        musicElement.play().catch(error => console.error("Error al reproducir la música:", error));
}

export function initializeAudio(): void // Inicializa la reproducción de audio. Debe ser llamada por una interacción del usuario, para cumplir con las políticas de autoplay de los navegadores.
{
    if (isInitialized)
        return;
	const playPromise = musicElement.play();
	if (playPromise !== undefined)
		playPromise.then(() => {isInitialized = true;}).catch(() => {isInitialized = false;});
}
