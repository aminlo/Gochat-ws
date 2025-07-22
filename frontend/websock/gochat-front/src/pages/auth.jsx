import { signup as Signup, login } from '../utils/auth'
import { useState, useEffect } from "react";
import Pingapi from '../utils/pingapi'
import { useUser } from '../utils/usercontext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(true);
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    useEffect(() => {
        Pingapi();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isSignup) {

                await Signup(email, username, password);
                console.log('Signup successful!');
            } else {

                const response = await login(email, password);
                console.log('Login successful!', response);
                setUser(response)
                navigate('/dash');
            }
        } catch (error) {
            console.error(`${isSignup ? 'Signup' : 'Login'} failed:`, error.message);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsSignup(true)}

            >
                Signup
            </button>
            <button
                type="button"
                onClick={() => setIsSignup(false)}

            >
                Login
            </button>
            <button type="button">Dev Review!</button>

            {/* buttons above */}
            <div>{isSignup ? 'Signup' : 'Login'}</div>
            <form onSubmit={handleSubmit}>
                {isSignup && (<input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />)}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit">
                    {isSignup ? 'Sign Up' : 'Log In'}
                </button>
            </form>
        </div>
    );
}
export default AuthPage