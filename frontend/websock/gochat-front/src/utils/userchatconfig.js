const API_URL = 'http://localhost:3000';

export async function Createchat(hubname) {
    const response = await fetch(`${API_URL}/au/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hubname })
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Login failed: ${error}`);
    }
}