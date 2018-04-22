const Token = require('../../objects/Token');
const OsuPacket = require('../../main_modules/osu-packet');
const updatestatistics = require('../private/UpdateStatistics');
const userpresence = require('./UserPresence');

function statusupdate(token, data){
    const user = Token.getDatabyUserToken(token);
    const writer = new OsuPacket.Bancho.Writer;
    if(user){
        let TokenStatus = user.status;
        let TokenStatusBeatmap = user.status.beatmap;
        try {
            TokenStatus.status = data.status;
            
            TokenStatusBeatmap.beatmapChecksum = data.beatmapChecksum;
            TokenStatusBeatmap.currentMods = data.currentMods;
            TokenStatusBeatmap.playMode = data.playMode;
            TokenStatusBeatmap.beatmapId = data.beatmapId;
            if(Boolean(data.currentMods & 128 || data.currentMods & 8192)){
                TokenStatus.statusText = 'With RX '+data.statusText;
                user.relaxing = true;
                if(!user.relaxAnnounced){
                    user.relaxAnnounced = true;
                    writer.Announce('You enabled RX Scoreboard! Disable RX or AP to disable RX Scoreboard!');
                    updatestatistics(token, 0, true, true);
                    userpresence(token, 0, false);
                }
            } else {
                user.relaxing = false;
                TokenStatus.statusText = data.statusText;
                if(user.relaxAnnounced){
                    user.relaxAnnounced = false;
                    writer.Announce('You disabled RX Scoreboard! Enable RX or AP to enable RX Scoreboard!');
                    updatestatistics(token, 0, true, false);
                    userpresence(token, 0, false);
                }
            }
            setTimeout(() => {
                updatestatistics(token, 0, true);
                userpresence(token, 0, false);
            }, 100);
            Token.BroadcastToToken(token, writer.toBuffer);
        } catch (ex){
            console.error(ex);
        }
    }
}

module.exports = statusupdate;