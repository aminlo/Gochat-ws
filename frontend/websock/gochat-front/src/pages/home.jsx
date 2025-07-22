import { Link } from "react-router-dom";
import { useUser } from '../utils/usercontext';

const Home = () => {
    const { user } = useUser();
    return <><h1>Home</h1>
        <div>Start chatting now</div>
        <div>Login, Signup user or signup as dev rev</div>
        <div>{user && (<p>your logged in {user.email}</p>)}</div>
        <Link to="/auth">Signup/login here</Link>
    </>;
};

export default Home;
