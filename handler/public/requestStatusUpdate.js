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
    if(bot){
        return;
    }
    if(user){
        const TokenData = user;
        const TokenStatus = user.status;
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
        writer.HandleOsuUpdate(obj);
        if(toToken.length > 0)
            Token.BroadcastToToken(toToken, writer.toBuffer);
        else Token.BroadcastToToken(TokenData.token, writer.toBuffer);
    }
}

module.exports = requestStatusUpdate;