const OsuPacket = require('../../main_modules/osu-packet');
const Token = require('../../objects/Token');
const fs = require('fs');
const path = require('path');

function requestStatusUpdate(token, userid = 0, toToken = '', bot = false){
    const writer = new OsuPacket.Bancho.Writer();
   
    let user;
    if(userid > 0){
        user = Token.getDatabyUserID(userid);
    } else {
        user = Token.getDatabyUserToken(token);
    }
    if(user){
        const TokenData = user[1];
        const TokenStatus = user[1].status;
        const TokenStatusBeatmap = TokenStatus.beatmap;
        
        let obj;
        
        obj = {
            userId: TokenData.general.UserID,
            status: TokenStatus.status,
            statusText: TokenStatus.statusText,
            beatmapChecksum: TokenStatusBeatmap.beatmapChecksum,
            currentMods: TokenStatusBeatmap.currentMods,
            playMode: TokenStatusBeatmap.playMode,
            beatmapId: TokenStatusBeatmap.beatmapId,
            rankedScore: TokenStatus.rankedScore,
            accuracy: TokenStatus.accuracy,
            playCount: TokenStatus.playCount,
            totalScore: TokenStatus.totalScore,
            rank: TokenStatus.rank, 
            performance: TokenStatus.performance
        };
        if(bot){
            let botPresenceRawJson = fs.readFileSync(path.join(__dirname + '/../../configs/botPresence.json')).toString();
            let botPresence = JSON.parse(botPresenceRawJson);
            if(botPresence.accuracy == "{tokenaccuracy}") botPresence.accuracy = TokenStatus.accuracy;
            else botPresence.accuracy = botPresence.accuracy / 100
            if(botPresence.playCount == "{tokenplaycount}") botPresence.accuracy = TokenStatus.playCount;
            if(botPresence.rank == "{tokenrank}") botPresence.accuracy = TokenStatus.rank;
            if(botPresence.performance == "{tokenpp}") botPresence.accuracy = TokenStatus.performance;
            obj = {
                userId: 100,
                status: botPresence.StatusCode,
                statusText: botPresence.StatusText,
                beatmapChecksum: botPresence.beatmapChecksum,
                currentMods: botPresence.currentMods,
                playMode: botPresence.playMode,
                beatmapId: botPresence.beatmapId,
                rankedScore: botPresence.rankedScore,
                accuracy: botPresence.accuracy,
                playCount: botPresence.playCount,
                totalScore: botPresence.totalScore,
                rank: botPresence.rank,
                performance: botPresence.performance
            };
        }
        writer.HandleOsuUpdate(obj);
        if(toToken.length > 0)
            Token.BroadcastToToken(toToken, writer.toBuffer);
        else Token.BroadcastToToken(TokenData.token, writer.toBuffer);
    }
}

module.exports = requestStatusUpdate;