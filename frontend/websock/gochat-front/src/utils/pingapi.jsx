const usepingAuthEndpoint = async () => {
    try {
        const response = await fetch(`https://gochat-1064103315272.us-central1.run.app`, {
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