const common = require('../../common');

const OsuPacket = require('../../main_modules/osu-packet');
const PacketStream = require('../../objects/PacketStreams');
const Token = require('../../objects/Token');

const util = require('util');

const mysql = common.MySQLManager;
const redis = common.RedisManager;
const usertools = common.UserTools;
const logger = common.Logger;

function startHandling() {
    setInterval(async () => {
        await redis.lrange('BanchoEvent', 0, 0, async (err, fields) => {
            const element = fields[0];
            if(element){
                const j = JSON.parse(element);
                await handleEvent(j.event, j, 0);
                await redis.lset('BanchoEvent', 0, '{"event": "Handled"}');
                await redis.lrem('BanchoEvent', 0, '{"event": "Handled"}');
            }
        })
    }, 50);
}

async function handleEvent(Event, Obj = {}, row) {
    const writer = new OsuPacket.Bancho.Writer;
    let messageOBJECT = {
        From: Obj.from,
        To: Obj.to,
        Message: Obj.message
    }
    let alertOBJECT = {
        Message: Obj.message,
        To: Obj.to
    }
    let kickObject = {
        User: Obj.to,
        Reason: Obj.message
    }
    let updateStatsOBJECT = {
        UserID: Obj.to,
        Forced: Obj.forced
    }
    switch (Event) {
        case 'BanchoMessage':
            let fromuserid = await usertools.getuserid(messageOBJECT.From);
            writer.SendMessage({
                sendingClient: messageOBJECT.From,
                message: messageOBJECT.Message,
                target: messageOBJECT.To,
                senderId: fromuserid
            });
            if(messageOBJECT.To.startsWith('#')){
                PacketStream.BroadcastToStream('main', writer.toBuffer);
            } else {
                let userid = await usertools.getuserid(messageOBJECT.To);
                Token.BroadcastToUserID(userid, writer.toBuffer);
            }
            logger.debug('Write BanchoMessage');
            return true;
            break;
        case 'Announce':
            writer.Announce(alertOBJECT.Message);
            if(alertOBJECT.To > 0)
                Token.BroadcastToUserID(alertOBJECT.To, writer.toBuffer);
            else
                PacketStream.BroadcastToStream('main', writer.toBuffer);
            logger.debug('Write Announce');
            return true;
            break;
        case 'Kick':
            let userid = 0;
            if(!util.isNumber(kickObject.User)){
                userid = await usertools.getuserid(kickObject.User);
            } else userid = kickObject.User;

            writer.LoginReply(-1);
            writer.Announce('Hey dude! You have been kicked from the server.');
            
            Token.BroadcastToUserID(userid, writer.toBuffer);
            let deleteToken = new Promise ((resolve, reject) => {
                setTimeout(() => {
                    Token.removeToken(null, userid);
                    resolve(true);
                }, 2000);
            });
            logger.debug('Write Kick');
            await deleteToken;
            return true;
            break;
        case 'updateStats':
            let tokenobject = Token.getDatabyUserID(updateStatsOBJECT.UserID);
            try {
                await require('./UpdateStatistics')(tokenobject[1].token, updateStatsOBJECT.UserID, updateStatsOBJECT.Forced, tokenobject[1].relaxing);
                require('../public/requestStatusUpdate')(tokenobject[1].token, updateStatsOBJECT.UserID, tokenobject[1].token)
                return true;
            }catch(ex){
                // Mostly if user isn't online
                return false;
            } 
            logger.debug('Write updateStats');
			break;
        default:
            break;
    }
}

module.exports = {
    startHandling
}