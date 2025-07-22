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
        throw new Error(`Create failed: ${error}`);
    }
}

export async function Listrooms() {
    const response = await fetch(`${API_URL}/au/ownrooms`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ROom fetch failed: ${error}`);
    }
    return response.json()
}