import { useUser } from '../utils/usercontext';
import { useNavigate } from 'react-router-dom';
import { Createchat, Listrooms, Deleteroom } from '../utils/userchatconfig'
import { useState } from "react";
import { useEffect } from "react";

const Userdash = () => {
    const { user } = useUser();
    const date = new Date(user.created_at);
    const formatdate = date.toLocaleString()
    const [hubname, sethubname] = useState("");
    const [roomlist, setRoomlist] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);


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

    useEffect(() => {
        fetchlistrooms();
    }, []);

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
        <div>
            Hi (username)
            <div>{user.email}</div>
            <div>{user.id}</div>
            <div>{formatdate}</div>

            <hr />
            <div>manage ur chats here</div>
            <div>Create hub</div>
            <form onSubmit={handleCreateChat}>
                <input
                    type="text"
                    placeholder="chat name!"
                    value={hubname}
                    onChange={e => sethubname(e.target.value)}
                    required
                />
                <button type="submit">Create Chat</button>
            </form>
            <div>
                Ur rooms!:
                {roomlist?.length > 0 && roomlist.map((room) => (
                    <div key={room.id}>
                        <div>room id: {room.id}</div>
                        <div>room name: {room.name}</div>
                        <div>room isactive: {room.roomactive ? 'Yes' : 'No'}</div>
                        <div>client count: {room.client_count}</div>
                        <button type="button" onClick={() => handleInspectRoom(room)}>inspect</button>
                        <br />
                    </div>
                ))}
            </div>
            <div>
                {
                    selectedRoom ? (
                        <div>
                            <h2>Room Details: {selectedRoom.name}</h2>
                            <div>
                                <p><strong>Room ID:</strong> {selectedRoom.id}</p>
                                <p><strong>Room Name:</strong> {selectedRoom.name}</p>
                                <p><strong>Room Description:</strong> {selectedRoom.description}</p>

                                <p><strong>Status:</strong> {selectedRoom.roomactive ? 'Active' : 'Inactive'}</p>
                                <p><strong>Connected Users:</strong> {selectedRoom.client_count}</p>
                                <p><strong>Save Messages:</strong> Yes/no</p>
                                <p><strong>Run room</strong> Yes/no</p>
                                <button type="button" onClick={() => handleDeleteRoom(selectedRoom.id)}
                                    style={{ backgroundColor: 'red', color: 'white', marginRight: '10px' }}>
                                    Delete Room
                                </button>
                            </div>

                            <button type="button" onClick={closeRoomDetails}>Close</button>
                            {/* You can add more room details here using selectedRoom */}
                        </div>
                    ) : (
                        <div>Select a room to inspect</div>
                    )
                }
            </div>
        </div >
    );
}

export default Userdash