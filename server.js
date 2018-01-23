// Main Modules
const base64 = require('urlsafe-base64');
const fs = require('fs');
const express = require('express');
const OsuPacket = require('./main_modules/osu-packet');

// Secoundary Modules
const config = require('./config');
const common = require('./common');
const Token = require('./objects/Token');
const PacketStream = require('./objects/PacketStreams');
const mainhandler = require('./handler/mainhandler');
const eventHandler = require('./handler/private/eventHandler');
const Channel = require('./objects/Channel');
const Bot = require('./objects/Bot');

const http = require('http');

// Stream
PacketStream.addStream('main');
Token.deleteAlltokens();
Bot.ParseCommands();
Channel.createDefault();

setTimeout(() => {
    eventHandler.startHandling();
}, 5000);

// Start TimeoutCheck ONLY CALL IT ONCE!!!
Token.StartTimeoutCheck(1000);

// Add our Bot!
let botToken = Token.addToken([100, config.Bancho.BotName, false, 524284, false, 24, 0, 6, 0, 0]);

// Logger
const logger = common.Logger;

// // Express
// const app = express();

http.createServer((req, res) => {
        // User-Agent is not Osu?!?? WTF Render Index View!
        if(req.headers['user-agent'] != 'osu!'){
            render(res, 'views/index.html');
            return;
        }
        const requestToken = req.headers['osu-token'];
        req.on('data', (data)=>{
            if(requestToken == undefined){
                try {
                    const LoginHandler = require('./handler/loginhandler');
                    LoginHandler(res, req, data);
                } catch (ex){
                    console.log(ex);
                }
            } 
            else {
                if(Token.checkToken(requestToken)){
                    try {
                        mainhandler(requestToken, data);
                    } catch (ex){
						console.log(ex);
                        const writer = new OsuPacket.Bancho.Writer();
                        writer.Announce("Error: "+ex);
                        Token.BroadcastToToken(requestToken, writer.toBuffer);
                    }
                    res.writeHead(200,{
                        'cho-protocol': 19,
                        'Connection': 'keep-alive',
                        'Keep-Alive': 'timeout=5, max=100',
                        'Content-Type': 'text/html; charset=UTF-8'
                    });
                    const TokenData = Token.getDatabyUserToken(requestToken);
                    if(TokenData){
                        let ReadStream = Token.Tokens[TokenData[0]].output;
                        let readed = ReadStream.read();
                        if(readed == null)
                            readed = new Buffer('');
                        res.write(readed);
                        res.end();
                    }
                    
                } else {
                    res.writeHead(200,{
                        'cho-protocol': config.server.choprotocolversion,
                        'Connection': 'keep-alive',
                        'Keep-Alive': 'timeout=5, max=100',
                        'Content-Type': 'text/html; charset=UTF-8'
                    });
                    const writer = new OsuPacket.Bancho.Writer();
                    writer.Announce("Error: Token not found.");
                    writer.LoginReply(-5)
                    res.end(writer.toBuffer);
                }
            }
        });
}).listen(config.server.port);
// app.post('/', (req, res) => {

// });

// app.use((req, res)=>{
//     render(res, 'views/index.html');
// });

// app.listen(config.server.port, () => {
//     logger.success("Server is listen on Port %s", config.server.port)
// });

const render = (res, path)=>{
    let file;
    try{
        file = fs.readFileSync(path);
    } catch(ex) {
        file = ex.toString();
    }
    
    res.write(file);
    res.end();
};
/*
console.log(base64.encode(new Buffer('{"ayy": "TEST"}')));
*/