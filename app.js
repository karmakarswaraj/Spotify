const clientId = '43fe5a801e59424fa801b8317022d29a';
const clientSecret = 'b32e774db9df44758e34d3631b3e46ef';

const getAccessTocken = async () => {
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials',

    });
}
