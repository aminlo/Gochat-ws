const API_URL = 'http://localhost:3000';

export async function Ownchats(user) {
    const response = await fetch(`${API_URL}/singup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password })
    });