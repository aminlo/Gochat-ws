import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from '../utils/usercontext';


const Home = () => {
    const { user } = useUser();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:3000/roomlist");
                if (!res.ok) throw new Error("Failed to load rooms");
                const data = await res.json();
                setRooms(Array.isArray(data) ? data.slice(0, 3) : []);
            } catch (e) {
                setError("Couldn't load rooms");
                setRooms([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    return (
        <div className="bg-white-gray-gradient min-h-screen flex flex-col">
            {/* Top Nav */}
            <header className="w-full sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="font-extrabold tracking-tight text-xl">
                        Gochat
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link className="btn btn-soft btn-secondary" to="/roomlist">Browse Rooms</Link>
                        {user ? (
                            <Link className="btn btn-success" to="/dash">Dashboard</Link>
                        ) : (
                            <Link className="btn btn-primary" to="/auth">Login / Signup</Link>
                        )}
                    </div>
                </div>
            </header>

            <section className="relative w-full">
                <img
                    src="/images/catlaptop.jpg"
                    alt="Hero background"
                    className="h-[55vh] w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold drop-shadow">
                            Chat in real-time. Simple. Fast. Fun!
                        </h1>
                        <p className="mt-3 text-sm sm:text-base opacity-95 max-w-2xl mx-auto">
                            Create your own room, invite friends, or jump into public rooms. No complications, just conversations.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            {user ? (
                                <Link className="btn btn-success" to="/dash">Go to your Dashboard</Link>
                            ) : (
                                <Link className="btn btn-success" to="/auth">Get started with just a click!</Link>
                            )}
                            <Link className="btn btn-outline btn-primary" to="/roomlist">Explore Public Rooms</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-4 -mt-8 sm:-mt-12">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="card bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h10v2H4z" /></svg>
                            <h3 className="font-semibold">Create and manage rooms</h3>
                        </div>
                        <p className="text-sm opacity-80">Spin up rooms, edit details, toggle saving, and monitor activity from your dashboard.</p>
                    </div>
                    <div className="card bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" /></svg>
                            <h3 className="font-semibold">Join instantly</h3>
                        </div>
                        <p className="text-sm opacity-80">Public rooms are one click away. Join authenticated with your unique username or join as an anon user!</p>
                    </div>
                    <div className="card bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-8l-2-2H3c-1.1 0-2 .9-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" /></svg>
                            <h3 className="font-semibold">Clean, responsive UI</h3>
                        </div>
                        <p className="text-sm opacity-80">Built with Tailwind + DaisyUI to look great on mobile and desktop.</p>
                    </div>
                </div>
            </section>

            {/* Live rooms preview */}
            <section className="max-w-6xl mx-auto px-4 mt-8 mb-12 w-full">
                <div className="rounded-2xl shadow-lg p-6 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Trending public rooms</h2>
                        <Link className="btn btn-soft btn-secondary" to="/roomlist">View all</Link>
                    </div>
                    {loading ? (
                        <div>Loading rooms…</div>
                    ) : error ? (
                        <div className="text-error">{error}</div>
                    ) : rooms.length === 0 ? (
                        <div className="opacity-70">No rooms available right now.</div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {rooms.map(room => (
                                <div key={room.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold truncate max-w-[60%]" title={room.name}>{room.name}</div>
                                        <div className="inline-grid *:[grid-area:1/1]">
                                            {room.roomactive ? (
                                                <>
                                                    <div className="status status-success animate-ping" />
                                                    <div className="status status-success" />
                                                </>
                                            ) : (
                                                <>
                                                    <div className="status status-error animate-ping" />
                                                    <div className="status status-error" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs opacity-70">Room ID: {room.id}</div>
                                    <div className="text-xs">
                                        Status: {room.roomactive ? <span className="text-green-700">Online</span> : <span className="text-red-500">Offline</span>}
                                    </div>
                                    <div className="text-xs">Users: {room.client_count}</div>
                                    <Link
                                        className="btn btn-soft btn-primary mt-2"
                                        to={`/ch/${room.id}`}
                                    >
                                        {room.roomactive ? 'Join' : 'Open'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-6 text-center opacity-70 text-sm">
                <div>WebSocket chat demo</div>
                <div>Github Repo link: https://github.com/aminlo/Gochat-ws</div>
            </footer>
        </div>
    )
};

export default Home;

