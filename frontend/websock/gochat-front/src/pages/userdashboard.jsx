import { useUser } from '../utils/usercontext';
import { useNavigate } from 'react-router-dom';
import { Createchat, Listrooms, Deleteroom, Updateroom, Runroom } from '../utils/userchatconfig'
import { useState } from "react";
import { useEffect } from "react";

const Userdash = () => {
    const { user, loading } = useUser();
    const navigate = useNavigate();
    const [hubname, sethubname] = useState("");
    const [roomlist, setRoomlist] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        save_messages: false
    });

    useEffect(() => {
        if (user) {
            fetchlistrooms();
        }
    }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            const timer = setTimeout(() => {
                navigate('/auth');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [loading, user, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return (
            <div>
                <div>Please log in</div>
                <div>Redirecting to login page in 3 seconds...</div>
            </div>
        );
    }

    const date = new Date(user.created_at);
    const formatdate = date.toLocaleString();

    const handleRunRoom = async (roomId) => {
        try {
            const result = await Runroom(roomId);
            console.log('Room server started successfully!', result);
            alert('Room server started successfully!');

            await fetchlistrooms();
        } catch (error) {
            console.error("Failed to start room server:", error);
            alert('Failed to start room server.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            name: '',
            description: '',
            save_messages: false
        });
    };

    const handleEditRoom = () => {
        setEditForm({
            name: selectedRoom.name || '',
            description: selectedRoom.description || '',
            save_messages: selectedRoom.save_messages || false
        });
        setIsEditing(true);
    };

    const handleUpdateRoom = async (e) => {
        e.preventDefault();

        try {
            const updateData = {
                name: editForm.name,
                description: editForm.description,
                save_messages: editForm.save_messages
            };

            await Updateroom(selectedRoom.id, updateData);
            console.log('Room updated successfully!');

            const updatedRoomList = roomlist.map(room =>
                room.id === selectedRoom.id
                    ? { ...room, ...updateData } // spread operator replaces data (overrides)
                    : room
            );
            setRoomlist(updatedRoomList);

            setSelectedRoom({ ...selectedRoom, ...updateData });

            setIsEditing(false);
            alert('Room updated successfully!');

        } catch (error) {
            console.error("Failed to update room:", error);
            alert('Failed to update room. Please try again.');
        }
    };

    const handleInspectRoom = (room) => {
        setSelectedRoom(room);
    };

    const closeRoomDetails = () => {
        setSelectedRoom(null);
    };


    const handleCreateChat = async (e) => {
        e.preventDefault();

        try {
            await Createchat(hubname);
            console.log('Hub make successful!');
            sethubname("");
            fetchlistrooms();
        } catch (error) {
            console.error("Failed to create chat:", error);
        }
    };

    const fetchlistrooms = async () => {

        try {
            const roomlist = await Listrooms();
            console.log('Room list fetch!', roomlist);
            setRoomlist(roomlist);
        } catch (error) {
            console.error("Failed to fetch list", error);
        }
    };


    const handleDeleteRoom = async (roomId) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await Deleteroom(roomId);
                console.log('Room deleted successfully!');

                // map to remove room instead of re fetching saving reqs
                setRoomlist(roomlist.filter(room => room.id !== roomId));

                if (selectedRoom && selectedRoom.id === roomId) {
                    setSelectedRoom(null);
                }

            } catch (error) {
                console.error("Failed to delete room:", error);
                alert('Failed to delete room. Please try again.');
            }
        }
    };

    return (
        <div className="bg-white-gray-gradient flex items-center justify-center">
            <div className="rounded-2xl shadow-lg p-8 w-[80vw] h-[80vh] mx-auto my-12 bg-white ">
                <div className="flex w-full h-full">
                    <div className="card bg-base-300 rounded-box grid  grow place-items-center basis-[30%]">
                        <div class="flex w-full flex-col">
                            <div className="card bg-black/20 rounded-box grid w-[80%] p-5 mt-5 mx-auto">
                                <div className="flex justify-center">
                                    <img
                                        src="https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                                        alt="User avatar"
                                        style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 12 }}
                                    />
                                </div>
                                <div><strong>Hi</strong> {user.username}</div>
                                <div><strong>Email:</strong> {user.email}</div>
                                <div><strong>User ID:</strong> {user.id}</div>
                                <div><strong>Created:</strong> {formatdate}</div>
                            </div>
                            <div class="divider w-[50%] mx-auto"></div>
                            <div class="card rounded-box gridplace-items-center p-5 bg-black/20 mt-5 w-[80%] mx-auto">
                                <div><strong>Create hub</strong></div><br></br>
                                <form onSubmit={handleCreateChat}>
                                    <input
                                        className="input w-[70%]"
                                        type="text"
                                        placeholder="chat name!"
                                        value={hubname}
                                        onChange={e => sethubname(e.target.value)}
                                        required
                                    />
                                    <button type="submit" class="btn btn-neutral join-item">Create Chat</button><br></br>
                                </form >
                                <br></br>
                                <div className="overflow-y-auto w-full " style={{ maxHeight: '35vh', minHeight: '35vh' }}>
                                    {roomlist?.length > 0 && roomlist.map((room) => (
                                        <div key={room.id}
                                            className="bg-white rounded shadow p-3 mb-3 flex flex-col pb-4">
                                            <div>room id: {room.id}</div>
                                            <div>room name: {room.name}</div>
                                            <div>room isactive: {room.roomactive ? 'Yes' : 'No'}</div>
                                            <div>client count: {room.client_count}</div>
                                            <button type="button" className="btn btn-soft btn-success self-end mr-2px" onClick={() => handleInspectRoom(room)}>inspect</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="divider divider-horizontal"></div>
                    <div className="card bg-base-300 rounded-box grid grow place-items-center basis-[70%]">
                        {
                            selectedRoom ? (
                                <div className="bg-black/20 p-10 rounded h-[95%] w-[95%]">
                                    <h2><strong>Room:</strong> {selectedRoom.name}</h2>
                                    <div >
                                        {
                                            selectedRoom ? (
                                                <div>

                                                    {!isEditing ? (
                                                        // changes display mode 
                                                        <div>

                                                            <img
                                                                src="https://t4.ftcdn.net/jpg/09/83/98/09/360_F_983980918_Put4YfWMOydwJ7hJtjEjpUly9SIlLQ1M.jpg"
                                                                alt="Room"
                                                                style={{ width: 120, height: 120, borderRadius: '10px', objectFit: 'cover' }}
                                                            />

                                                            <p><strong>Room ID:</strong> {selectedRoom.id}</p>
                                                            <p><strong>Room Name:</strong> {selectedRoom.name}</p>
                                                            <p><strong>Room Description:</strong> {selectedRoom.description || 'No description'}</p>
                                                            <p><strong>Save Messages:</strong> {selectedRoom.save_messages ? 'Yes' : 'No'}</p>
                                                            <p><strong>Status:</strong> {selectedRoom.roomactive ? 'Active' : 'Inactive'}</p>
                                                            <p><strong>Connected Users:</strong> {selectedRoom.client_count}</p>

                                                            <div style={{ marginTop: '15px' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleEditRoom}
                                                                    style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px' }}
                                                                >
                                                                    Edit Room
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRunRoom(selectedRoom.id)}
                                                                    style={{ backgroundColor: 'green', color: 'white', marginRight: '10px' }}
                                                                >
                                                                    Run Server
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteRoom(selectedRoom.id)}
                                                                    style={{ backgroundColor: 'red', color: 'white' }}
                                                                >
                                                                    Delete Room
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // in edit mode
                                                        <form onSubmit={handleUpdateRoom}>
                                                            <div>
                                                                <label>
                                                                    <strong>Room Name:</strong>
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.name}
                                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                        required
                                                                    />
                                                                </label>
                                                            </div>

                                                            <div>
                                                                <label>
                                                                    <strong>Description:</strong>
                                                                    <textarea
                                                                        value={editForm.description}
                                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                        placeholder="Room description (optional)"
                                                                    />
                                                                </label>
                                                            </div>

                                                            <div>
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editForm.save_messages}
                                                                        onChange={(e) => setEditForm({ ...editForm, save_messages: e.target.checked })}
                                                                    />
                                                                    <strong>Save Messages</strong>
                                                                </label>
                                                            </div>

                                                            <div>
                                                                <button
                                                                    type="submit"
                                                                    style={{ backgroundColor: 'green', color: 'white' }}
                                                                >
                                                                    Save Changes
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCancelEdit}
                                                                    style={{ backgroundColor: 'gray', color: 'white' }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )
                                                    }


                                                </div >
                                            ) : (
                                                <div>Select a room to inspect</div>
                                            )
                                        }
                                    </div >

                                    <button type="button" onClick={closeRoomDetails}>Close</button>

                                </div >
                            ) : (
                                <div>Select a room to inspect</div>
                            )
                        }
                    </div >
                </div >
            </div >
        </div >
    );
}

export default Userdash