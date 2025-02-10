if (process.env.REACT_APP_NODE_ENV !== 'production') {
    module.exports = {
        BackendEndpoint: 'http://localhost:8000/admin',
    };
}
else {
    module.exports = {
        BackendEndpoint: 'https://backend.lasertrader.co/admin',
    };
}

