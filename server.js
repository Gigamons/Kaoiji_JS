// Main Modules
const base64 = require('urlsafe-base64');
const fs = require('fs');
const util = require('util');
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

// Stream
PacketStream.addStream('main');
PacketStream.addStream('lobby');
Token.deleteAlltokens();
Channel.createDefault();

setTimeout(() => {
  eventHandler.startHandling();
}, 5000);

// Start TimeoutCheck ONLY CALL IT ONCE!!!
Token.StartTimeoutCheck();

// Add our Bot!
let botToken = Token.addToken([1, config.Bancho.BotName, false, 524284, false, 24, 0, 6, 0, 0]);

// Logger
const logger = common.Logger;

// Express
const app = express();
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

app.use('/api/v1', require('./handler/private/api'));

app.use('/', (req, res) => {
  if (req.headers['user-agent'] != 'osu!') {
    render(res, 'views/index.html');
    return;
  }

  const requestToken = req.header('osu-token');

  req.on('data', (data) => {
    if (!requestToken) {
      try {
        const LoginHandler = require('./handler/loginhandler');
        LoginHandler(res, req, data);
      } catch (ex) {
        console.error(ex);
      }
    } else {
      if (Token.checkToken(requestToken)) {
        try {
          mainhandler(requestToken, data);
        } catch (ex) {
          console.log(ex);
          const writer = new OsuPacket.Bancho.Writer();
          writer.Announce("Error: " + ex);
          Token.BroadcastToToken(requestToken, writer.toBuffer);
        }
        res.writeHead(200, {
          'cho-protocol': 19,
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=5, max=100',
          'Content-Type': 'text/html; charset=UTF-8'
        });
        const TokenData = Token.getDatabyUserToken(requestToken);
        if (TokenData) {
          let ReadStream = TokenData.output;
          let readed = ReadStream.read();
          let readed2 = TokenData.mpoutput.read();
          if (readed == null)
            readed = new Buffer('');
          if (readed2 == null)
            readed2 = new Buffer('');
          res.write(Buffer.concat([readed, readed2]));
          res.end();
        }
      } else {
        res.writeHead(403, {
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
});

app.get('/killServer', (req, res) => {
  if(req.query.k === config.server.apikey)
    process.exit(0);
})

app.listen(config.server.port, () => {
  logger.success("Server is listen on Port %s", config.server.port)
});


const render = (res, path) => {
  let file;
  try {
    file = fs.readFileSync(path);
  } catch (ex) {
    file = ex.toString();
  }

  res.write(file);
  res.end();
};
