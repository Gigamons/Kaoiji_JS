module.exports = {
    server: {
        port: 5001,
        apikey: '',
        choprotocolversion: 19,
        debug: false
    },
    Bancho: {
        ServerName: 'BananaCho',
        BotName: 'BananaBot',
        SupportEmail: 'support@bananacho.ml',
        freedirect: true
    },
    osu: {
        apikey: ''
    },
    mysql: {
        pool: 128,
        host: '127.0.0.1',
        port: 3306,
        username: 'root',
        password: '',
        database: 'bananacho'
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        password: '' // Just set this to None for disabling password
    }
};