import { Link } from "react-router-dom";

const Home = () => {
    return <><h1>Home</h1>
        <div>Start chatting now</div>
        <div>Login, Signup user or signup as dev rev</div>
        <Link to="/auth">Signup/login here</Link>
    </>;
};

export default Home;
