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
    const [cusAlert, setCusAlert] = useState({ type: '', message: '', show: false });
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
            const newRoomList = await Listrooms();
            setRoomlist(newRoomList);

            const updatedRoom = newRoomList.find(room => room.id === roomId);
            setSelectedRoom(updatedRoom);
            showCusAlert('success', 'Room ran successfully!');
        } catch (error) {
            console.error("Failed to start room server:", error);
            showCusAlert('error', `Failed to start room ${error}!`);
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
    function showCusAlert(type, message) {
        setCusAlert({ type, message, show: true });
        setTimeout(() => setCusAlert({ type: '', message: '', show: false }), 3000);
    }
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
            showCusAlert('success', 'Room updated successfully!');

        } catch (error) {
            console.error("Failed to update room:", error);
            alert('Failed to update room. Please try again.');
        }
    };

    const handleInspectRoom = (room) => {
        setSelectedRoom(room);
        setIsEditing(false);
        setEditForm({
            name: '',
            description: '',
            save_messages: false
        });
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
        <div>
            {cusAlert.show && (
                <div
                    role="alert"
                    className={`alert alert-${cusAlert.type} flex items-center gap-2 mb-4 fixed top-6 left-1/2 transform -translate-x-1/2 z-50`}
                    style={{ minWidth: '300px', maxWidth: '90vw' }}
                >
                    {cusAlert.type === 'success' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    {cusAlert.type === 'error' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span>{cusAlert.message}</span>
                </div>
            )}
            <div className="bg-white-gray-gradient flex items-center justify-center">
                <div className="rounded-2xl shadow-lg p-8 w-[80vw] h-[80vh] mx-auto my-12 bg-white ">
                    <div className="flex w-full h-full">
                        <div className="card bg-base-300 rounded-box grid  grow place-items-center basis-[30%]">
                            <div className="flex w-full flex-col">
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
                                <div className="divider w-[50%] mx-auto"></div>
                                <div className="card rounded-box gridplace-items-center p-5 bg-black/20 mt-5 w-[80%] mx-auto">
                                    <div><strong>Create hub</strong></div><br></br>
                                    <form onSubmit={handleCreateChat}>
                                        <input
                                            className="input w-[74%]"
                                            type="text"
                                            placeholder="chat name!"
                                            value={hubname}
                                            onChange={e => sethubname(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="btn btn-neutral join-item">Create Chat</button><br></br>
                                    </form >
                                    <br></br>
                                    <div className="overflow-y-auto w-full " style={{ maxHeight: '35vh', minHeight: '35vh' }}>
                                        {roomlist?.length > 0 && roomlist.map((room) => (
                                            <div key={room.id}
                                                className="bg-white rounded shadow p-3 mb-3 flex flex-col pb-4">
                                                <div className="inline-grid *:[grid-area:1/1]">
                                                    {room.roomactive ? (
                                                        <>
                                                            <div><div className="status status-success animate-ping"></div></div>
                                                            <div className='text-green-700'><div className="status status-success "></div> <strong>Online</strong></div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div><div className="status status-error animate-ping"></div></div>
                                                            <div className='text-red-500'><div className="status status-error"></div> <strong>Offline</strong></div>
                                                        </>
                                                    )}
                                                </div>
                                                <div>Room id: {room.id}</div>
                                                <div>Room name: {room.name}</div>
                                                {room.roomactive && <div>Connected Users: {room.client_count}</div>}

                                                <button type="button" className="btn btn-soft btn-primary self-end mr-2px" onClick={() => handleInspectRoom(room)}>inspect</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="divider divider-horizontal"></div>

                        {/* right side */}
                        <div className="card bg-base-300 rounded-box grid grow place-items-center basis-[70%]">
                            {
                                selectedRoom ? (
                                    <div className="bg-black/20 rounded h-[95%] w-[95%] flex flex-col">
                                        <div >
                                            {
                                                selectedRoom ? (
                                                    <div>
                                                        <div className="rounded w-full h-[10vw]">
                                                            <img
                                                                src="https://t4.ftcdn.net/jpg/09/83/98/09/360_F_983980918_Put4YfWMOydwJ7hJtjEjpUly9SIlLQ1M.jpg"
                                                                alt="Room" className="w-full h-[100%] object-cover "
                                                            />
                                                        </div>
                                                        {!isEditing ? (
                                                            // changes display mode 
                                                            <div>

                                                                <div className="p-10">
                                                                    <div className="bg-white/80 rounded-xl shadow p-6 mb-4">
                                                                        <p className="mb-2"><strong>Room ID:</strong> <span className="text-gray-700">{selectedRoom.id}</span></p>
                                                                        <p className="mb-2"><strong>Room Name:</strong> <span className="text-blue-700">{selectedRoom.name}</span></p>
                                                                        <p className="mb-2"><strong>Room Description:</strong> <span className="text-gray-600">{selectedRoom.description || 'No description'}</span></p>
                                                                        <p className="mb-2"><strong>Save Messages:</strong> <span className="text-green-700">{selectedRoom.save_messages ? 'Yes' : 'No'}</span></p>

                                                                        <p className="mb-2"><strong>Status: </strong>
                                                                            <span className={selectedRoom.roomactive ? "text-green-700" : "text-red-700"}>{selectedRoom.roomactive ? 'Active' : 'Inactive'} </span>
                                                                            <div className="inline-grid *:[grid-area:1/1]">
                                                                                {selectedRoom.roomactive ? (
                                                                                    <>
                                                                                        <div className="status status-success animate-ping"></div>
                                                                                        <div className="status status-success"></div>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="status status-error animate-ping"></div>
                                                                                        <div className="status status-error"></div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </p>
                                                                        <p><strong>Connected Users:</strong> <span className="text-purple-700">{selectedRoom.client_count}</span></p>
                                                                    </div>
                                                                    <div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleEditRoom}
                                                                            className="btn btn-soft btn-info self-end mr-[10px]"
                                                                        >
                                                                            Edit Room
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRunRoom(selectedRoom.id)}
                                                                            className="btn btn-soft btn-success self-end mr-[10px]"
                                                                        >
                                                                            Run Room
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteRoom(selectedRoom.id)}
                                                                            className="btn btn-soft btn-error self-end"
                                                                        >
                                                                            Delete Room
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // in edit mode
                                                            <div className="bg-white/80 rounded-xl shadow p-6 mb-4 m-10">
                                                                <form onSubmit={handleUpdateRoom}>
                                                                    <div className="mb-2">
                                                                        <label>
                                                                            <strong>Room Name: </strong>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.name}
                                                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                                required
                                                                            />
                                                                        </label>
                                                                    </div>

                                                                    <div className="mb-2">

                                                                        <label>
                                                                            <strong>Description:</strong>
                                                                            <fieldset className="fieldset">
                                                                                <textarea
                                                                                    value={editForm.description}
                                                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                                    placeholder="Room description (optional)"
                                                                                    className="textarea h-24"
                                                                                />
                                                                            </fieldset>
                                                                        </label>


                                                                    </div>

                                                                    <div className="mb-2">
                                                                        <label>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={editForm.save_messages}
                                                                                onChange={(e) => setEditForm({ ...editForm, save_messages: e.target.checked })}
                                                                                className="checkbox"
                                                                            />
                                                                            <strong> Save Messages</strong>
                                                                        </label>
                                                                    </div>

                                                                    <div>
                                                                        <button
                                                                            type="submit"
                                                                            className='btn btn-soft btn-success self-end mr-[10px]'
                                                                        >
                                                                            Save Changes
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleCancelEdit}
                                                                            className='btn btn-soft btn-default self-end mr-[10px]'
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        )
                                                        }


                                                    </div >
                                                ) : (
                                                    <div>Select a room to inspect</div>
                                                )
                                            }
                                        </div >

                                        <button type="button" onClick={closeRoomDetails}
                                            className="btn btn-soft btn-default mt-auto self-start m-[40px]"
                                        >Close</button>

                                    </div >
                                ) : (
                                    <div>Select a room to inspect</div>
                                )
                            }
                        </div >
                    </div >
                </div >
            </div >
        </div>
    );
}

export default Userdash