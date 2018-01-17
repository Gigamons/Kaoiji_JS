const Token = require('../../objects/Token');
const requestStatusUpdate = require('./requestStatusUpdate');
const OsuPacket = require('../../main_modules/osu-packet');

function presense(token, userid, bot){
    const writer = new OsuPacket.Bancho.Writer();
    let user;
    let test;
    if(userid != undefined){
        user = Token.getDatabyUserID(userid);
    } else {
        user = Token.getDatabyUserToken(token);
    }
    if(user){
        const UserID = user[1].general.UserID;
        const UserName = user[1].general.UserName;
        const presence = user[1].presence;
        
        let obj = {
            userId: UserID,
            username: UserName,
            timezone: presence.timezone,
            countryId: presence.countryId,
            permissions: presence.permissions,
            longitude: presence.longitude,
            latitude: presence.latitude,
            rank: user[1].status.rank
        };
        writer.UserPresence(obj);
        Token.BroadcastToToken(token, writer.toBuffer);
    }
}

module.exports = presense;