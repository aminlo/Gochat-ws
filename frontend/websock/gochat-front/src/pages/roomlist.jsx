import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from '../utils/usercontext';

const RoomDirectory = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useUser();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/roomlist");
            if (!res.ok) throw new Error("Failed to fetch rooms");
            const data = await res.json();
            if (data.length === 0) {
                setRooms([]);
                return;
            }
            const filteredRooms = data.filter(room =>
                room.name.toLowerCase().includes(search.toLowerCase())
            );
            setRooms(filteredRooms);
        } catch (err) {
            console.log(err)
            setRooms([])
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleJoin = (roomId) => {
        navigate(`/ch/${roomId}`);
    };

    // Filter rooms by search term

    return (
        <div className="bg-white-gray-gradient flex items-center justify-center min-h-screen">
            <div className="rounded-2xl shadow-lg p-8 w-[80vw] h-[80vh] mx-auto my-12 bg-white">
                <div className="flex flex-col items-center h-full">
                    <h2 className="text-2xl font-bold mb-6">Public Rooms Directory</h2>
                    <div className="flex gap-4 mb-4 w-full max-w-xl">
                        {user &&
                            <button
                                className="btn btn-soft btn-accent mb-4"
                                onClick={() => navigate('/dash')}
                            >
                                Go to Your Dashboard
                            </button>
                        }
                        <input
                            className="input w-full text-center"
                            type="text"
                            placeholder="Search rooms..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button
                            className="btn btn-soft btn-secondary"
                            onClick={fetchRooms}
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </div>
                    {loading && <div>Loading rooms...</div>}

                    <div className="overflow-y-auto w-full" style={{ maxHeight: '60vh', minHeight: '40vh' }}>
                        {rooms.length === 0 && !loading ? (
                            <div className="text-gray-500">No rooms available.</div>
                        ) : (
                            rooms.map(room => (
                                <div key={room.id}
                                    className="bg-white rounded shadow p-3 mb-3 flex flex-col pb-4 w-[90%] mx-auto">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-lg">{room.name}</div>
                                            <div className="text-xs text-gray-500">Room ID: {room.id}</div>
                                            <div className="text-xs">
                                                Status: {room.roomactive
                                                    ? <span className="text-green-700">Online</span>
                                                    : <span className="text-red-500">Offline</span>}
                                            </div>
                                            <div className="text-xs">Users: {room.client_count}</div>
                                        </div>
                                        <button
                                            className="btn btn-soft btn-primary"
                                            disabled={!room.roomactive}
                                            onClick={() => handleJoin(room.id)}
                                        >
                                            Join
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDirectory;