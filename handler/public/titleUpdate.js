const Token = require('../../objects/Token');
const OsuPacket = require('../../main_modules/osu-packet');
const PacketStream = require('../../objects/PacketStreams');

const fs = require('fs');
const path = require('path');

function askUpdate(token) {
    const writer = new OsuPacket.Bancho.Writer;
    writer.TitleUpdate("|");
    Token.BroadcastToToken(token, writer.toBuffer);
}


module.exports = askUpdate;