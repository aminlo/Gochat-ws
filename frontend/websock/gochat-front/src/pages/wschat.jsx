import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../utils/usercontext';

const WSChat = () => {
    const { hubId } = useParams();
    const { user, loading } = useUser();
    const [messages, setMessages] = useState([]); // message list
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const wsRef = useRef(null); // track of webs link 
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!hubId || loading) return;

        const websUrl = user
            ? `ws://localhost:3000/au/ws/${hubId}`
            : `ws://localhost:3000/ws/${hubId}`;
        const ws = new WebSocket(websUrl);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'message') {
                    setMessages((prev) => [...prev, data]);
                } else if (data.type === 'user_list') {
                    setOnlineUsers(data.users || []);
                } else if (data.type === 'user_joined') {
                    setOnlineUsers((prev) => [...prev, data.user]);
                } else if (data.type === 'user_left') {
                    setOnlineUsers((prev) => prev.filter(u => u.id !== data.user.id));
                }
            } catch (e) {
                console.log(e)
                // catch but leav for now
            }
        };

        ws.onclose = () => setConnected(false);

        return () => ws.close();
    }, [hubId, user, loading]);

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

    return (
        <div>
            {/* Sidebar */}
            <div>
                <h3>Room: {hubId}</h3>
                <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
                {/* <p>User: {user ? user.username : 'Anonymous'}</p> */}
                <h4>Online ({onlineUsers.length})</h4>
                {onlineUsers.map((u, i) => (
                    <div key={i}>{u.username}</div>
                ))}
            </div>
            {/* Chat Area */}
            <div>
                <div>
                    {messages.map((msg, i) => (
                        <div key={i}>
                            <strong>{msg.user?.username || 'Unknown'}:</strong> {msg.message}
                            <div>
                                {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                        disabled={!connected}
                    />
                    <button type="submit" disabled={!connected || !input.trim()}>Send</button>
                </form>
            </div>
        </div>
    );
};

export default WSChat;