const SQLString = require('sqlstring');

const Token = require('../../objects/Token');
const common = require('../../common');

const MySQL = common.MySQLManager;
const UserTools = common.UserTools;
const Tokens = Token.Tokens;

async function updatestats(token, userid, forced = false){
    if(!forced) return;
    let user;
    if(token == undefined){
        user = Token.getDatabyUserID(userid);
    } else {
        user = Token.getDatabyUserToken(token);
    }
    if(user){
        try {
            const TokenData = user[1];
            const TokenID = user[0];
            let TokenBeatmap = Tokens[TokenID].status.beatmap;
            let gamemode = 'std';
            let gamemodeid = TokenBeatmap.playMode;
            console.log(gamemodeid)
            if(gamemodeid == 0)
                gamemode = 'std';
            else if (gamemodeid == 1)
                gamemode = 'taiko';
            else if (gamemodeid == 2)
                gamemode = 'ctb';
            else if (gamemodeid == 3)
                gamemode = 'mania';
            else gamemode = 'std';

            console.log(gamemode);
            userid = TokenData.general.UserID;
            if(Tokens[TokenID].relaxing){
                let LeaderBoard = await UserTools.getLeaderBoard(userid, gamemodeid, true);
                const q = LeaderBoard[1];
                Tokens[TokenID].status.rankedScore = q['rankedscore_'+gamemode];
                Tokens[TokenID].status.accuracy = q['accuracy_'+gamemode];
                Tokens[TokenID].status.playCount = q['playcount_'+gamemode];
                Tokens[TokenID].status.totalScore = q['totalscore_'+gamemode];
                Tokens[TokenID].status.rank = LeaderBoard[0];
                Tokens[TokenID].status.performance = q['pp_'+gamemode];
            } else {
                let LeaderBoard = await UserTools.getLeaderBoard(userid, gamemodeid, false);
                const q = LeaderBoard[1];
                Tokens[TokenID].status.rankedScore = q['rankedscore_'+gamemode];
                Tokens[TokenID].status.accuracy = q['accuracy_'+gamemode];
                Tokens[TokenID].status.playCount = q['playcount_'+gamemode];
                Tokens[TokenID].status.totalScore = q['totalscore_'+gamemode];
                Tokens[TokenID].status.rank = LeaderBoard[0];
                Tokens[TokenID].status.performance = q['pp_'+gamemode];
            }
        } catch (ex){
            console.log(ex);
        }
    }
}
    
module.exports = updatestats;