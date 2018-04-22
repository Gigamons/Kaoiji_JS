const Token = require('../../objects/Token');
const OsuPacket = require('../../main_modules/osu-packet');

function pong (t) {
    const user = Token.getDatabyUserToken(t);
    user.TimeoutTimer = new Date().getTime();
}

module.exports = pong;