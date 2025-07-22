import { useUser } from '../utils/usercontext';
import { useNavigate } from 'react-router-dom';

const Userdash = () => {
    const { user } = useUser();
    const date = new Date(user.created_at);
    const formatdate = date.toLocaleString()

    return (
        <div>
            Hi (username)
            <div>{user.email}</div>
            <div>{user.id}</div>
            <div>{formatdate}</div>

            <hr></hr>
            <div>manage ur chats here</div>

        </div >
    )

}

export default Userdash