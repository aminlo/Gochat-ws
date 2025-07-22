const API_URL = 'http://localhost:3000'; // <-- Put your API base URL here

export default async function signup(email, password) {
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    return response.json();
}

