import Signup from './../utils/auth'
import { useState } from "react";


const AuthPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
            Signup(username, password);
        } catch (error) {
            console.error('Signup failed:', error);
        }
    };

    return (
        <div>
            <div>Signup</div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );

}

export default AuthPage