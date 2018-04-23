const common = require('../../common');
const mysql = common.MySQLManager;
const Token = require('../../objects/Token');
const OsuPacket = require('../../main_modules/osu-packet');

async function addFriend(token, friendid = 1) {
  const user = Token.getDatabyUserToken(token);
  if(!user) return;

  await removeFriend(token, friendid);
  mysql.query('INSERT INTO friends (userid, friendid) VALUES (?, ?)', user.general.UserID, friendid);
}

async function removeFriend(token, friendid = 1) {
  const user = Token.getDatabyUserToken(token);
  if(!user) return;

  await mysql.query('DELETE FROM friends WHERE userid = ? AND friendid = ?', user.general.UserID, friendid);
}

async function friendList(token) {
  const user = Token.getDatabyUserToken(token);
  if(!user) return;

  const q = await mysql.query('SELECT friendid FROM friends WHERE userid = ?', user.general.UserID);
  const w = new OsuPacket.Bancho.Writer();
  let fidlist = [];
  for (let i = 0; i < q.length; i++) {
    const f = q[i];
    fidlist.push(f.friendid)
  }
  w.FriendsList(fidlist);
  Token.BroadcastToToken(token, w.toBuffer);
}
module.exports = {
  addFriend,
  removeFriend,
  friendList
}