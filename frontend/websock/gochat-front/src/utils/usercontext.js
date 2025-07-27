import { createContext, useContext, useState, useEffect } from 'react';
import { verifyuser } from './auth';
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // https://www.dhiwise.com/post/enhancing-user-experience-with-the-loading-component-in-react
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const userData = await verifyUser();
                setUser(userData);
                console.log('User verified from JWT:', userData);
            } catch (error) {
                console.log('JWT verification failed:', error.message);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, []);


    const logout = () => {
        setuserandstore(null);
    };
    const setuserandstore = (userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('User saved to localstorage:', userData);
        } else {
            localStorage.removeItem('user');
            console.log('Removed user from localstorage');
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, loading, setuserandstore, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('not used within context');
    }
    return context;
};