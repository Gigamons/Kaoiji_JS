const Token = require('../../objects/Token');
const OsuPacket = require('../../main_modules/osu-packet');
const updatestatistics = require('../private/UpdateStatistics');
const userpresence = require('./UserPresence');

function statusupdate(token, data){
    const user = Token.getDatabyUserToken(token);
    const writer = new OsuPacket.Bancho.Writer;
    if(user){
        const TokenID = user[0];
        const TokenStatus = Token.Tokens[TokenID].status;
        const TokenStatusBeatmap = Token.Tokens[TokenID].status.beatmap;
        try {
            if(Boolean(data.currentMods & 128 || data.currentMods & 8192)){
                TokenStatus.statusText = 'With RX '+data.statusText;
                Token.Tokens[TokenID].relaxing = true;
                if(!Token.Tokens[TokenID].relaxAnnounced){
                    Token.Tokens[TokenID].relaxAnnounced = true;
                    writer.Announce('You enabled RX Scoreboard! Disable RX or AP to disable RX Scoreboard!');
                    updatestatistics(token, 0, true, true);
                    userpresence(token, 0, false);
                }
            } else {
                Token.Tokens[TokenID].relaxing = false;
                if(Token.Tokens[TokenID].relaxAnnounced){
                    Token.Tokens[TokenID].relaxAnnounced = false;
                    writer.Announce('You disabled RX Scoreboard! Enable RX or AP to enable RX Scoreboard!');
                    Token.BroadcastToToken(token, writer.toBuffer);
                    updatestatistics(token, 0, true, false);
                    userpresence(token, 0, false);
                }
                TokenStatus.statusText = data.statusText;
            }
            TokenStatus.status = data.status;
            
            TokenStatusBeatmap.beatmapChecksum = data.beatmapChecksum;
            TokenStatusBeatmap.currentMods = data.currentMods;
            if(data.playMode != TokenStatusBeatmap.playMode){
                setTimeout(() => {
                    updatestatistics(token, 0, true);
                    userpresence(token, 0, false);
                }, 100);
            }
            TokenStatusBeatmap.playMode = data.playMode;
            TokenStatusBeatmap.beatmapId = data.beatmapId;
            Token.BroadcastToToken(token, writer.toBuffer);
        } catch (ex){
            console.error(ex);
        }
    }
}

module.exports = statusupdate;