const usepingAuthEndpoint = async () => {
    try {
        const response = await fetch('http://localhost:3000', {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error('Failed get, server down?');
        }
        const data = await response.text();
        console.log('Ping response:', data);
        return data;
    } catch (error) {
        console.error('Error pinging auth endpoint:', error);
        return null;
    }
};

export default usepingAuthEndpoint;