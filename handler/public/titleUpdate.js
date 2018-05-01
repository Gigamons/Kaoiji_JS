const Token = require('../../objects/Token');
const config = require('../../config');
const OsuPacket = require('../../main_modules/osu-packet');

function askUpdate(token) {
    const writer = new OsuPacket.Bancho.Writer;
    writer.TitleUpdate("http://i.ppy.sh/logo.png|" + config.Bancho.NewsLogoLink);
    Token.BroadcastToToken(token, writer.toBuffer);
}


module.exports = askUpdate;