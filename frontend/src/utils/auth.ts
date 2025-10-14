// viewFunction() -> es el parametro de protectedRoute()
// (element: HTMLElement) => void) -> es el tipo de parametro viewFunction() -> acepta un parametro (element: HTMLElement) y devuelve void.
// (element: HTMLElement) => void) -> el segundo bloque es la firma de la propia protectedRoute()
// return (element: HTMLElement) => -> protectedRoute() devuelve una función anónima.
// return; -> Detiene la ejecución y no renderiza la vista protegida
// viewFunction(element); -> Si el usuario existe, ejecuta la función de la vista original

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

export function protectedRoute(viewFunction: (element: HTMLElement) => void): (element: HTMLElement) => void 
{
    return (element: HTMLElement) => 
	{
		const user = localStorage.getItem('user');
		if (!user)
		{
		    navigate('/login');
		    return;
		}
		viewFunction(element);
    };
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response>
{
    const token = localStorage.getItem('access_token');
    if (!token)
    {
        navigate('/login');
        throw new Error('User not authenticated.');
    }

    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Bearer ${token}`);

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) 
    {
        console.warn("Access token expired or invalid. Attempting to refresh...");
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken)
        {
            console.log("Retrying the request with the new token.");
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            response = await fetch(url, { ...options, headers });
        }
        else
        {
            console.error("Token refresh failed. Logging out.");
            localStorage.clear();
            navigate('/login');
            throw new Error('Session has expired. Please log in again.');
        }
    }
    return response;
}

async function refreshAccessToken(): Promise<string | null> 
{
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) 
    {
        console.error('No refresh token available.');
        return null;
    }
    try 
    {
        const response = await fetch('/api/auth/refresh', 
		{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!response.ok) 
        {
            const error = await response.json();
            throw new Error(error.message || 'Could not refresh token.');
        }

        const data = await response.json();
        const newAccessToken = data.access_token;
        localStorage.setItem('access_token', newAccessToken);
        console.log('Access token refreshed successfully.');
        return newAccessToken;
    } 
    catch (error) 
    {
        console.error('Error refreshing token:', error);
        return null;
    }
}
