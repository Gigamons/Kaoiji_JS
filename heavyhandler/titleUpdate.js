const Token = require('../objects/Token');
const OsuPacket = require('../main_modules/osu-packet');
const PacketStream = require('../objects/PacketStreams');

const fs = require('fs');
const path = require('path');

fs.watchFile(path.join(__dirname+'/../configs/TitlePicture.json'), () => {
    const writer = new OsuPacket.Bancho.Writer;
    let jsonraw = fs.readFileSync(path.join(__dirname+'/../configs/TitlePicture.json'));
    let j = JSON.parse(jsonraw);
    writer.TitleUpdate(j.ImageURL+'|'+j.OnClickUrl);
    PacketStream.BroadcastToStream('main', writer.toBuffer);
});

function askUpdate(token) {
    const writer = new OsuPacket.Bancho.Writer;
    let jsonraw = fs.readFileSync(path.join(__dirname+'/../configs/TitlePicture.json'));
    let j = JSON.parse(jsonraw);
    writer.TitleUpdate(j.ImageURL+'|'+j.OnClickUrl);
    Token.BroadcastToToken(token, writer.toBuffer);
}


module.exports = askUpdate;