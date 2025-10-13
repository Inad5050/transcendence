// authenticatedFetch() -> Realiza peticiones a los endpoints del backend protegidos por middleware -> requieren el JWT.
// url -> La URL a la que se hará la petición. 
// options -> Opciones adicionales para la petición fetch (method, body, etc.).
// RequestInit -> es una interfaz predefinida de TypeScript y describe la forma que tiene el objeto 'opciones' de la función fetch. Incluye propiedades como method, headers, body, etc.
// = {} -> es un parámetro por defecto. Si no proporcionamos el segundo argumento, este tomará el valor de un objeto vacío. Esto hace que el segundo argumento sea opcional.
// Promise -> Una función async siempre devuelve una Promesa. Una Promesa es un objeto que representa la eventual finalización (o fallo) de una operación asíncrona.
//  || {} -> (short-circuitin) El operador || evalúa la expresión de la izquierda (options.headers). Si es "truthy devuelve ese valor. Si es falsy (null, undefined, false, 0, o "") se devuelve el valor de la derecha. 
// Bearer: es parte del estándar RFC 6750 que Niko usa en el back.
// ... -> (sintaxis de propagación) toma una estructura de datos (como un objeto o un array) y saca todos sus elementos para ponerlos en otro lugar. Es el equivalente a listar todos los elementos del contenedor, en este caso lo usamos para añadir otro elemento al final (headers).

import { navigate } from '../main';

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response>
{
    const token = localStorage.getItem('access_token');
    if (!token)
	{
        navigate('/login');
        throw new Error('Usuario no autenticado.');
    }
    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Bearer ${token}`);
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) 
	{
        console.error("Token de acceso expirado o inválido.");
        navigate('/login');
        throw new Error('La sesión ha expirado.');
    }
    return response;
}
