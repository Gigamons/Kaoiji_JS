const Token = require('../objects/Token');
const OsuPacket = require('../main_modules/osu-packet');

function pong (t) {
    const Writer = new OsuPacket.Bancho.Writer;
    const user = Token.getDatabyUserToken(t);
    const TokenID = user[0];
    Token.Tokens[TokenID].TimeoutTimer = new Date().getTime();

    Writer.BeatmapInfoReply();
    Token.Tokens[TokenID].output.write(Writer.toBuffer)
}

module.exports = pong;