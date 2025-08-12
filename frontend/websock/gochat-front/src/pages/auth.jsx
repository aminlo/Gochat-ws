import React from 'react';
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
    const [error, setError] = useState('');
    useEffect(() => {
        Pingapi();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignup) {
                await Signup(email, username, password);
                navigate('/dash');
            } else {
                const response = await login(email, password);
                setUser(response)
                navigate('/dash');
            }
        } catch (err) {
            setError(`${isSignup ? 'Signup' : 'Login'} failed: ${err.message}`);
        }
    }

    return (
        <div className="bg-white-gray-gradient flex items-center justify-center min-h-screen ">
            <div className="card bg-white rounded-2xl shadow-lg p-8 w-[400px] mx-12 my-12 min-w-[350px]">
                {/* <div className="card bg-white rounded-2xl shadow-lg p-8 w-[400px] mx-auto"> */}
                <div className="w-full mb-6">
                    <div className="tabs tabs-lift w-full flex justify-center">
                        <button
                            type="button"
                            className={`tab flex-1 ${!isSignup ? 'tab-active' : ''}`}
                            onClick={() => setIsSignup(false)}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={`tab flex-1 ${isSignup ? 'tab-active' : ''}`}
                            onClick={() => setIsSignup(true)}
                        >
                            Signup
                        </button>
                    </div>
                    <div className="text-3xl font-bold mt-6 text-center">{isSignup ? 'Sign Up' : 'Log In'}</div>
                </div>
                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        className={`input input-bordered w-full transition-all duration-200 ${isSignup ? '' : 'opacity-0 pointer-events-none h-0 p-0 m-0'}`} // pointer envents == no action, then ensure props are all 0 and collpased
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required={isSignup}
                        tabIndex={isSignup ? 0 : -1} // to ensure when tabbing, username field is skipped/shown
                    />
                    <input
                        type="email"
                        className="input input-bordered w-full"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="input input-bordered w-full"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-success w-full mt-2">
                        {isSignup ? 'Sign Up' : 'Log In'}
                    </button>
                </form>
                <div className="divider my-6">or</div>
                <button type="button" className="btn btn-soft btn-info w-full" disabled>
                    Dev Review!
                </button>
            </div>
        </div>
    );
}

export default AuthPage;