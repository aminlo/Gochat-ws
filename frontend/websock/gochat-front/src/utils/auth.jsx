
const API_URL = `https://gochat-1064103315272.us-central1.run.app`;

export async function signup(email, username, password) {
    const response = await fetch(`${API_URL}/singup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Signup failed details: ${error}`);
    }

    return response.json();
}

export async function login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Login failed details: ${error}`);
    }

    return response.json();
}



export async function verifyuser() {
    const response = await fetch(`${API_URL}/au/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Authentication failed');
    }

    return response.json();
}