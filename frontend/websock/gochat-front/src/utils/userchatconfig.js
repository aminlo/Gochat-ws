const API_URL = 'http://localhost:3000';

export async function Createchat(hubname) {
    const response = await fetch(`${API_URL}/au/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: hubname })
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

export async function Deleteroom(roomid) {
    const response = await fetch(`${API_URL}/au/deleteroom/${roomid}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ROom delete failed: ${error}`);
    }
    return response.json()
}

export async function Editroom(roomid) {
    const response = await fetch(`${API_URL}/au/updateroom/${roomid}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ROom edit failed: ${error}`);
    }
    return response.json()
}

export async function Runroom(roomid) {
    const response = await fetch(`${API_URL}/au/run/${roomid}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ROom run run failed: ${error}`);
    }
    return response.json()
}