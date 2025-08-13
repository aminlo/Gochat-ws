import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../utils/usercontext';
import { useNavigate } from 'react-router-dom';

const WSChat = () => {
    const { hubId } = useParams();
    const { user, loading } = useUser();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const wsRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [whoamiUser, setWhoamiUser] = useState(null);

    useEffect(() => {
        if (!hubId || loading) return;
        const API_URL = "gochat-1064103315272.us-central1.run.app";
        const websUrl = user
            ? `ws://${API_URL}/au/ws/${hubId}`
            : `ws://${API_URL}/ws/${hubId}`;
        const ws = new WebSocket(websUrl);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'message') {
                    console.log(data)
                    setMessages((prev) => [...prev, data]);
                } else if (data.type === 'user_list') {
                    console.log(data)
                    setOnlineUsers(data.users || []);
                } else if (data.type === 'user_joined') {
                    console.log(data)
                    setOnlineUsers((prev) => [...prev, data.user]);
                } else if (data.type === 'user_left') {
                    setOnlineUsers((prev) => prev.filter(u => u.id !== data.user.id));
                    console.log(data)
                } else if (data.type === 'whoami') {
                    setWhoamiUser(data.user);
                }
            } catch (e) {
                console.log(e);
            }
        };

        ws.onclose = () => setConnected(false);

        return () => ws.close();
    }, [hubId, user, loading]);
    const navigate = useNavigate();
    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
        wsRef.current.send(JSON.stringify({ type: 'message', message: input.trim() }));
        setInput('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (loading) return <div>Loading...</div>;
    const uniqueOnlineUsers = onlineUsers.filter(
        (user, idx, arr) => arr.findIndex(u => u.id === user.id) === idx
    );

    return (
        <div className="bg-white-gray-gradient flex items-center justify-center min-h-screen p-2">
            <div className="rounded-2xl shadow-lg p-4 sm:p-8 w-[95vw] sm:w-[80vw] h-auto lg:h-[80vh] mx-auto my-4 sm:my-12 bg-white text-xs sm:text-sm xl:text-base">
                <div className="flex flex-col lg:flex-row h-auto lg:h-full">

                    {/* Sidebar */}
                    <div className="card bg-base-300 rounded-box flex flex-col w-full lg:w-auto h-auto lg:h-full mr-0 lg:mr-6">


                        <button
                            className="btn btn-outline btn-primary mx-auto mt-5 sm:w-[80%]"
                            onClick={() => navigate('/roomlist')}
                        >
                            Back to Room List
                        </button>
                        <div className="card bg-white/80 rounded-xl shadow w-[90%] sm:w-[80%] p-4 sm:p-5 mt-4 sm:mt-5 mx-auto">
                            <div className="flex justify-center mb-4">
                                <img
                                    src="https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                                    alt="User avatar"
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                                />
                            </div>
                            <div><strong>Hi</strong> {user?.username || whoamiUser?.username || 'Anonymous'}</div>
                            <div>
                                <strong>Status:</strong>{" "}
                                <span className={connected ? "text-green-700" : "text-red-700"}>
                                    {connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                            <div><strong>Room:</strong> {hubId}</div>
                        </div>

                        <div className="divider w-[50%] mx-auto "></div>

                        {/* Online Users List */}
                        <ul
                            className="list bg-base-100 rounded-box shadow-md mb-2 mx-auto w-[90%] sm:w-[80%] overflow-y-auto max-h-[200px] lg:max-h-none"
                        >
                            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                                Online Users ({uniqueOnlineUsers.length})
                            </li>
                            {uniqueOnlineUsers.map((u, i) => (
                                <li key={u.id || i} className="list-row flex items-center gap-3 p-2">
                                    <div>
                                        <img
                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-box"
                                            src="https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                                            alt="User avatar"
                                        />
                                    </div>
                                    <div className="list-col-grow">
                                        <div>{u.username}</div>
                                        <div className="text-xs uppercase font-semibold opacity-60">
                                            {u.status || 'Online'}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="divider lg:divider-horizontal"></div>

                    {/* Chat Area */}
                    <div className="card bg-base-300 rounded-box grid grow place-items-center w-full">
                        <div className="bg-black/20 rounded h-[90vh] sm:h-[95%] w-full sm:w-[95%] flex flex-col">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                <div className="bg-white/80 rounded-xl shadow p-4 sm:p-6 mb-4">
                                    {messages.length === 0 ? (
                                        <div className="text-gray-500">No messages yet.</div>
                                    ) : (
                                        messages.map((msg, i) => {
                                            const isOwn = msg.user?.id === (user?.id || whoamiUser?.id);
                                            return (
                                                <div key={i} className={`chat ${isOwn ? 'chat-end' : 'chat-start'}`}>
                                                    <div className="chat-image avatar">
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
                                                            <img
                                                                alt="User avatar"
                                                                src="https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="chat-header flex gap-2 items-center">
                                                        {msg.user?.username || 'Unknown'}
                                                        <time className="text-xs opacity-50">
                                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                                                        </time>
                                                    </div>
                                                    <div className="chat-bubble">{msg.message}</div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input */}
                            <form
                                onSubmit={sendMessage}
                                className="flex items-center p-2 sm:p-4 bg-white/80 rounded-t-xl shadow mt-auto"
                            >
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    disabled={!connected}
                                    className="input w-full mr-2"
                                />
                                <button
                                    type="submit"
                                    disabled={!connected || !input.trim()}
                                    className="btn btn-soft btn-success"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WSChat;