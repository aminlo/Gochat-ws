import { Link } from "react-router-dom";
import { useUser } from '../utils/usercontext';


const Home = () => {
    const { user } = useUser();
    return (
        <div className="bg-white-gray-gradient flex flex-col items-center">
            <nav className="w-full flex justify-center">
                <div className="">Gochat</div>
            </nav>

            <div className="relative w-full flex justify-center">
                <img
                    src="/images/catlaptop.jpg"
                    alt="Gochat Logo"
                    className="h-[50vh] w-full object-cover"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white drop-shadow-lg flex flex-col items-center">
                    The bla bla chat application!
                    <br /> <br />
                    {user ? (
                        <button className="btn btn-success btn-xl rounded-full mt-4 w-[10vw]">
                            <Link to="/dash">Hi {user.username}! <br></br>Go to dash</Link>
                        </button>
                    ) : (
                        <button className="btn btn-success btn-xl rounded-full mt-4">
                            <Link to="/auth">Join the action now! Signup/login here</Link>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center rounded-2xl shadow-lg bg-white p-6 w-[70vw] mx-auto -translate-y-1/9 mt-8">

                <div className="">
                    Welcome to Gochat! This is a placeholder for a 500-word introduction or description of the application.
                    <br /><br />
                    Gochat is a modern web-based chat platform designed to connect users in real-time. Whether you are here to catch up with friends, collaborate with colleagues, or meet new people, Gochat provides a seamless and secure environment for all your communication needs.
                    <br /><br />
                    Our platform leverages the latest web technologies to ensure fast, reliable, and interactive messaging. With a user-friendly interface, you can easily navigate through different chat rooms, manage your contacts, and customize your experience. Gochat supports both private and group conversations, allowing you to communicate the way you prefer.
                    <br /><br />
                    Security and privacy are at the core of Gochat. We use end-to-end encryption to protect your messages, ensuring that only you and your intended recipients can read them. Your personal information is never shared with third parties, and you have full control over your account settings.
                    <br /><br />
                    Getting started is simple. You can sign up as a regular user to join public chat rooms or create your own private spaces. For developers, we offer a special signup option that unlocks additional features, such as API access and integration tools. This makes Gochat an ideal choice for both casual users and tech enthusiasts.
                    <br /><br />
                    Our team is constantly working to improve the platform by adding new features and enhancing performance. We value your feedback and encourage you to share your thoughts with us. If you encounter any issues or have suggestions for improvement, please reach out through our support channels.


                </div>
                <div>
                    <h2>Technologies & Tools Used</h2>
                    <ul>
                        <li>React – For building the interactive frontend user interface.</li>
                        <li>Vite – For fast frontend development and hot module reloading.</li>
                        <li>Tailwind CSS – For utility-first, responsive, and modern styling.</li>
                        <li>React Router – For client-side routing and navigation.</li>
                        <li>WebSockets – For real-time chat communication between users.</li>
                        <li>Go (Golang) Backend – For handling authentication, chat logic, and WebSocket connections.</li>
                        <li>PostgreSQL – For persistent data storage (users, rooms, messages).</li>
                        <li>Docker – For containerized deployment and development environments.</li>
                        <li>ESLint & Prettier – For code quality and formatting.</li>
                    </ul>
                    <div>
                        This stack ensures a fast, secure, and scalable chat experience for all users.
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Home;

