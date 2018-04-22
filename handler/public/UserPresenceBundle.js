const Token = require('../../objects/Token');

const OsuPacket = require('../../main_modules/osu-packet');
const presence = require('./UserPresence');

function getusers(token, f=false){
    const writer = new OsuPacket.Bancho.Writer();

    let UserIDs = [];
    let output = new Buffer('');

    for(let i = 0, len = Token.Tokens.length; i < len; i++){
        UserIDs.push(Token.Tokens[i].general.UserID);
    }
    writer.UserPresenceBundle(UserIDs);
    if(!f){
        Token.BroadcastToToken(token, writer.toBuffer);
    }
}

module.exports = getusers;