import { useUser } from '../utils/usercontext';
import { useNavigate } from 'react-router-dom';
import { Createchat, Listrooms } from '../utils/userchatconfig'
import { useState } from "react";
import { useEffect } from "react";

const Userdash = () => {
    const { user } = useUser();
    const date = new Date(user.created_at);
    const formatdate = date.toLocaleString()
    const [hubname, sethubname] = useState("");
    const [roomlist, setRoomlist] = useState([]);

    const handleCreateChat = async (e) => {
        e.preventDefault();

        try {
            await Createchat(hubname);
            console.log('Hub make successful!');
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
                {roomlist.map((room) => (
                    <>
                        <div>room id: {room.id}</div>
                        <div>room name: {room.name}</div>
                        <div>room isactive: {room.roomactive}</div>
                        <div>room id: {room.client_count}</div>
                        <br></br>
                    </>
                ))}
            </div>
        </div >
    )

}

export default Userdash