const Token = require('../objects/Token');
const OsuPacket = require('../main_modules/osu-packet');

function pong (t) {
    const user = Token.getDatabyUserToken(t);
    const TokenID = user[0];
    Token.Tokens[TokenID].TimeoutTimer = new Date().getTime();
}

module.exports = pong;