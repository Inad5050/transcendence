// document.getElementById('background-music') => Obtiene el elemento <audio> del DOM.
// as HTMLAudioElement; => forma de aserción de tipo. Le dice a TypeScript que trate musicElement como un elemento de audio, dando acceso a propiedades como .src, .play() y .load().
// let isInitialized = false; => let: Declara una variable cuyo valor puede ser reasignado. Si una variable no se declara con let, se debe declarar con const, lo que la hace inmutable.

// Define y exporta la función playTrack => export function playTrack(...)
// if (musicElement.src.endsWith(trackUrl)) => Comprobamos si este audio ya ha sido solicitado, mirando el archivo al final del URL.
// musicElement.load(); => Carga el nuevo archivo de audio.
// musicElement.play().catch(...) => Inicia la reproducción. 
// El método .play() devuelve una Promesa, que se resuelve cuando la reproducción comienza con éxito. 
// El .catch() maneja cualquier error que pueda ocurrir (por ejemplo, si el navegador bloquea la reproducción automática).
// console => es un objeto global, proporcionado por el entorno de ejecución (el navegador o Node.js), que da acceso a la consola de depuración. No es parte del lenguaje JavaScript , sino una API del entorno.
// error => console.error("...", error):
// 		error: Este es el nombre del parámetro que recibirá la función. Cuando la promesa .play() es rechazada, el sistema le pasa automáticamente un objeto de error a esta función.
//		=>: Es el operador que separa los parámetros de la función del cuerpo de la misma.
//		console.error("...", error): Es el cuerpo de la función. Como solo es una única instrucción, no necesita llaves {}. El resultado de esta expresión se devuelve implícitamente
// export function initializeAudio(): void => Define y exporta la función initializeAudio. 
// Esta función es necesaria porque los navegadores modernos impiden que el audio se reproduzca automáticamente sin una interacción previa del usuario.

const musicElement = document.getElementById('background-music') as HTMLAudioElement;
let isInitialized = false;

export function playTrack(trackUrl: string): void
{
    if (musicElement.src.endsWith(trackUrl))
		return;
	musicElement.src = trackUrl;
	musicElement.load();
	if (isInitialized)
        musicElement.play().catch(error => console.error("Error al reproducir la música:", error));
}

export function initializeAudio(): void
{
    if (isInitialized)
        return;
	musicElement.play().then(() => {isInitialized = true;}).catch(() => {isInitialized = false;});
}
