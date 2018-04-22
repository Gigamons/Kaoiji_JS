module.exports = {
    server: {
        port: 5001,
        apikey: '',
        choprotocolversion: 19,
        debug: false
    },
    Bancho: {
        ServerName: 'Gigamons',
        BotName: 'GigaBot',
        SupportEmail: 'support@gigamons.de',
        freedirect: true
    },
    mysql: {
        pool: 128,
        host: '127.0.0.1',
        port: 3306,
        username: 'root',
        password: '',
        database: 'gigamons'
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        password: '' // Just set this to None for disabling password
    }
};