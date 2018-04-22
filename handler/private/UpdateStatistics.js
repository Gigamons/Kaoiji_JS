const SQLString = require('sqlstring');

const Token = require('../../objects/Token');
const common = require('../../common');

const MySQL = common.MySQLManager;
const UserTools = common.UserTools;
const Tokens = Token.Tokens;

async function updatestats(token, userid, forced = false) {
  if (!forced) return;
  let user;
  if (token === undefined) {
    user = Token.getDatabyUserID(userid);
  } else {
    user = Token.getDatabyUserToken(token);
  }
  if (user) {
    try {
      const TokenData = user;
      let TokenBeatmap = TokenData.status.beatmap;
      let gamemode = 'std';
      let gamemodeid = TokenBeatmap.playMode;
      if (gamemodeid === 0)
        gamemode = 'std';
      else if (gamemodeid === 1)
        gamemode = 'taiko';
      else if (gamemodeid === 2)
        gamemode = 'ctb';
      else if (gamemodeid === 3)
        gamemode = 'mania';
      else gamemode = 'std';

      userid = TokenData.general.UserID;
      if (TokenData.relaxing) {
        let LeaderBoard = await UserTools.getLeaderBoard(userid, gamemodeid, true);
        const q = LeaderBoard[1];
        let acc = (common.AccuracyHelper(q['count_300_' + gamemode], q['count_100_' + gamemode], q['count_50_' + gamemode], q['count_miss_' + gamemode], 0, 0, gamemodeid))
        if (!acc) acc = 1;
        TokenData.status.rankedScore = q['rankedscore_' + gamemode];
        TokenData.status.accuracy = acc;
        TokenData.status.playCount = q['playcount_' + gamemode];
        TokenData.status.totalScore = q['totalscore_' + gamemode];
        TokenData.status.rank = LeaderBoard[0];
        TokenData.status.performance = q['pp_' + gamemode];
      } else {
        let LeaderBoard = await UserTools.getLeaderBoard(userid, gamemodeid, false);
        const q = LeaderBoard[1];
        let acc = (common.AccuracyHelper(q['count_300_' + gamemode], q['count_100_' + gamemode], q['count_50_' + gamemode], q['count_miss_' + gamemode], 0, 0, gamemodeid))
        if (!acc) acc = 1;
        TokenData.status.rankedScore = q['rankedscore_' + gamemode];
        TokenData.status.accuracy = acc;
        TokenData.status.playCount = q['playcount_' + gamemode];
        TokenData.status.totalScore = q['totalscore_' + gamemode];
        TokenData.status.rank = LeaderBoard[0];
        TokenData.status.performance = q['pp_' + gamemode];
      }
    } catch (ex) {
      console.log(ex);
    }
  }
}

module.exports = updatestats;